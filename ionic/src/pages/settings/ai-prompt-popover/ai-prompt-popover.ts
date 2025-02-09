import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, ViewController, Content } from 'ionic-angular';
import { UtilsProvider } from '../../../providers/utils/utils';
import { LicenseProvider } from '../../../providers/license/license';
import { Config } from '../../../config';
import { ElectronProvider } from '../../../providers/electron/electron';
import { MarkdownService } from 'ngx-markdown';
import { OutputBlockModel } from '../../../models/output-block.model';
import { SettingsPage } from '../settings';
import { TelemetryService } from '../../../providers/telemetry/telemetry';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  outputBlocks?: OutputBlockModel[];
  isTyping?: boolean;  // Add this
  isPending?: boolean; // Add this to distinguish between typing animation and fetch pending state
  thinkingStep?: number; // Add this
  isError?: boolean;
  errorLink?: string;
  errorCta?: {
    text: string;
    link: string;
  };
}

interface ThinkingStep {
  text: string;
  delay: number;
}

interface ApiError {
  status: 'error';
  message: string;
  cta?: {
    text: string;
    link: string;
  }
}

@Component({
  selector: 'page-ai-prompt-popover',
  templateUrl: 'ai-prompt-popover.html',
})
export class AiPromptPopoverPage {
  @ViewChild(Content) content: Content;
  @ViewChild('promptInput') promptInput: ElementRef;
  public prompt: string = '';
  public messages: ChatMessage[] = [];
  public isLoading = false;
  public title: string;
  private aiDraftSequence: string = `[
  { "name": "BARCODE" },
]`;
  private thinkingSteps: ThinkingStep[] = [
    { text: "Analyzing the problem...", delay: 1500 },
    { text: "Combining requirements....", delay: 3000 },
    { text: "Crafting Output Template...", delay: 2000 },
    { text: "Optimizing Output Template...", delay: 800 },
    { text: "Adding final comments and tips...", delay: 500 }
  ];

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private utils: UtilsProvider,
    private licenseProvider: LicenseProvider,
    private electronProvider: ElectronProvider,
    private markdownService: MarkdownService,
    private telemetryService: TelemetryService,
  ) {
    // Remove URLs from markdown rendering
    let render = this.markdownService.renderer;
    render.link = function (href, title, text) { return text };

    this.addSystemMessage("How can I help you create a template today?");
  }

  private focusTextarea() {
    setTimeout(() => {
      this.promptInput.nativeElement.focus();
    }, 150);
  }

  ionViewDidEnter() {
    this.focusTextarea(); // Use the same method for initial focus
  }

  private async scrollToBottom(delay: number = 100) {
    setTimeout(() => {
      this.content.scrollToBottom(300);
    }, delay);
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
    this.scrollToBottom(0); // Immediate scroll for user input
  }

  private async typeWriter(text: string): Promise<string> {
    return new Promise<string>((resolve) => {
      let displayText = '';
      const words = text.split(' ');
      let wordIndex = 0;

      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          displayText += words[wordIndex] + ' ';
          this.messages[this.messages.length - 1].text =
            this.markdownService.compile(displayText, { renderer: this.markdownService.renderer });
          if (wordIndex % 5 === 0)
            this.scrollToBottom(100); // Scroll while typing
          wordIndex++;
        } else {
          clearInterval(interval);
          this.scrollToBottom(100); // Final scroll after typing
          resolve(displayText.trim());
        }
      }, 50); // Adjust speed as needed
    });
  }

  private async addSystemMessage(text: string, outputBlocks?: OutputBlockModel[], isPending: boolean = false) {
    const message: ChatMessage = {
      text: '',
      isUser: false,
      timestamp: new Date(),
      outputBlocks,
      isTyping: false,
      isPending: isPending
    };
    this.messages.push(message);

    if (!isPending) {
      await this.typeWriter(text);
      this.scrollToBottom(100); // Scroll after system message completes
    } else {
      this.scrollToBottom(0); // Immediate scroll for pending indicator
    }
    return message;
  }

  private processOutputBlocks(receivedBlocks: OutputBlockModel[]): OutputBlockModel[] {
    const availableBlocks = SettingsPage.GetAvailableOutputBlocks();

    return receivedBlocks.map(receivedBlock => {
      // Find the matching template block by name
      const templateBlock = availableBlocks.find(block => block.name === receivedBlock.name);

      if (templateBlock) {
        // Create a deep copy of the template block
        const baseBlock = JSON.parse(JSON.stringify(templateBlock));

        // Override with received properties
        return {
          ...baseBlock,
          ...receivedBlock
        };
      } else {
        // If no matching block found, return the received block as-is
        console.warn(`No template found for block: ${receivedBlock.name}`);
        return receivedBlock;
      }
    });
  }

  private async simulateThinking(message: ChatMessage, prompt: string) {
    const baseDelay = 800;
    for (let i = 0; i < this.thinkingSteps.length; i++) {
      message.thinkingStep = i;
      await new Promise(resolve => setTimeout(resolve, this.thinkingSteps[i].delay));
    }
  }

  private async addErrorMessage(error: ApiError) {
    const message = await this.addSystemMessage(error.message);
    message.text = error.message; // Ensure the error message is set directly
    this.telemetryService.sendEvent('ai_template_generate_error', null, error.message);
    message.isError = true;
    if (error.cta) {
      message.errorCta = error.cta;
    }
    return message;
  }

  onOpenErrorLink(cta: { text: string, link: string }) {
    if (cta && cta.link) {
      this.electronProvider.shell.openExternal(cta.link);
    }
  }

  async onCancelClick() {
    this.viewCtrl.dismiss();
  }

  async onGenerateClick() {
    if (!this.prompt.trim() || this.isLoading) {
      return;
    }

    this.telemetryService.sendEvent('ai_template_generate', null, this.prompt);
    this.addUserMessage(this.prompt);
    const userPrompt = this.prompt;
    this.prompt = '';
    this.isLoading = true;

    // Add a pending message that will be updated later
    const pendingMessage = await this.addSystemMessage('', null, true);
    this.simulateThinking(pendingMessage, this.prompt); // Pass the prompt

    try {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 828ad5b0afa9406691d93393053af2e7',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "email": localStorage.getItem('email'),
          "serial": this.licenseProvider.serial,
          "prompt": userPrompt,
          "history": this.messages.filter(m => m.isUser).map(m => m.text),
          "dratSequence": this.aiDraftSequence,
        })
      };

      const response = await fetch(Config.URL_LICENSE_SERVER_BASE + '/generate-template', options);
      const data = await response.json();

      // Remove the pending message first
      this.messages = this.messages.filter(m => m !== pendingMessage);

      if (data.status === 'error') {
        await this.addErrorMessage(data);
        return;
      }

      this.aiDraftSequence = data.template;
      const processedBlocks = this.processOutputBlocks(data.template);
      this.title = data.title;
      await this.addSystemMessage(data.explanation, processedBlocks);

    } catch (err) {
      // Remove the pending message
      this.messages = this.messages.filter(m => m !== pendingMessage);

      // Add error message
      const errorMessage = this.electronProvider.isDev()
        ? `Error: ${err.message}`
        : "Sorry, there was an error processing your request.";
      await this.addSystemMessage(errorMessage);
    } finally {
      this.isLoading = false;
      this.focusTextarea(); // Add focus after loading completes
    }
  }

  onUseTemplate(outputBlocks: OutputBlockModel[]) {
    this.viewCtrl.dismiss({
      template: outputBlocks,
      name: this.title,
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (!event.shiftKey) {
        event.preventDefault();
        this.onGenerateClick();
      }
    }
  }
}

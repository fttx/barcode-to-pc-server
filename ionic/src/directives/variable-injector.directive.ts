import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { PopoverController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { OutputTemplateState } from '../providers/output-template-state/output-template-state';

@Directive({
  selector: '[variableInjector]'
})
export class VariableInjectorDirective {
  private wrapper: HTMLElement;
  private button: HTMLElement;
  private popover: any;

  // List of all available variables
  private variables = [
    'barcode',
    'barcodes',
    'number',
    'text',
    'timestamp',
    'date_time',
    'scan_session_name',
    'device_name',
    'select_option',
    'http',
    'run',
    'csv_lookup',
    'csv_update',
    'javascript_function',
    'woocommerce',
    'google_sheets',
    'static_text'
  ];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private popoverCtrl: PopoverController,
    private outputTemplateState: OutputTemplateState,
    private translateService: TranslateService
  ) { }

  ngAfterViewInit() {
    this.wrapInputWithButton();
  }

  private wrapInputWithButton() {
    const input = this.el.nativeElement;

    // Create wrapper div
    this.wrapper = this.renderer.createElement('div');
    this.renderer.setStyle(this.wrapper, 'position', 'relative');
    this.renderer.setStyle(this.wrapper, 'display', 'block');

    // Create button
    this.button = this.renderer.createElement('button');
    this.button.innerHTML = `
      <svg style="width: 16px; height: 16px; vertical-align: middle;" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
      </svg>
    `;
    this.renderer.setStyle(this.button, 'position', 'absolute');
    this.renderer.setStyle(this.button, 'right', '8px');
    this.renderer.setStyle(this.button, 'top', '50%');
    this.renderer.setStyle(this.button, 'transform', 'translateY(-50%)');
    this.renderer.setStyle(this.button, 'background', '#5e5e5e');
    this.renderer.setStyle(this.button, 'color', 'white');
    this.renderer.setStyle(this.button, 'border', 'none');
    this.renderer.setStyle(this.button, 'border-radius', '4px');
    this.renderer.setStyle(this.button, 'padding', '4px 8px');
    this.renderer.setStyle(this.button, 'cursor', 'pointer');
    this.renderer.setStyle(this.button, 'z-index', '10');
    this.renderer.setStyle(this.button, 'line-height', '1');
    this.renderer.setAttribute(this.button, 'type', 'button');
    this.renderer.setAttribute(this.button, 'title', this.translateService.instant('insertVariable'));

    // Add hover effect
    this.renderer.listen(this.button, 'mouseenter', () => {
      this.renderer.setStyle(this.button, 'background', '#757575');
    });
    this.renderer.listen(this.button, 'mouseleave', () => {
      this.renderer.setStyle(this.button, 'background', '#5e5e5e');
    });

    // Add click handler
    this.renderer.listen(this.button, 'click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.showVariablesPopover(event);
    });

    // Insert wrapper before input
    const parent = input.parentNode;
    this.renderer.insertBefore(parent, this.wrapper, input);

    // Move input into wrapper
    this.renderer.appendChild(this.wrapper, input);

    // Add button to wrapper
    this.renderer.appendChild(this.wrapper, this.button);

    // Add padding to input to make room for button
    const isTextarea = input.tagName.toLowerCase() === 'textarea';
    if (isTextarea) {
      this.renderer.setStyle(this.button, 'top', '12px');
      this.renderer.setStyle(this.button, 'transform', 'none');
    }
    this.renderer.setStyle(input, 'padding-right', '40px');
  }

  private showVariablesPopover(event: Event) {
    console.log('[VariableInjector] Opening variable popover...');

    // Get available variables based on current template (uses stored editing block)
    const availableVariables = this.outputTemplateState.getAvailableVariables();
    const variablesToShow = this.variables.filter(v => availableVariables.indexOf(v) !== -1);

    // If no variables available, show a message
    if (variablesToShow.length === 0) {
      console.warn('[VariableInjector] No variables available to show!');
      return;
    }

    // Separate system variables from component variables
    const systemVariables = ['timestamp', 'scan_session_name', 'device_name'];
    const componentVariables = variablesToShow.filter(v => systemVariables.indexOf(v) === -1);
    const systemVarsToShow = variablesToShow.filter(v => systemVariables.indexOf(v) !== -1);

    // Create a simple popover component inline
    const popoverElement = this.renderer.createElement('div');
    this.renderer.setStyle(popoverElement, 'background', 'white');
    this.renderer.setStyle(popoverElement, 'border', '1px solid #ccc');
    this.renderer.setStyle(popoverElement, 'border-radius', '4px');
    this.renderer.setStyle(popoverElement, 'box-shadow', '0 2px 8px rgba(0,0,0,0.15)');
    this.renderer.setStyle(popoverElement, 'max-height', '300px');
    this.renderer.setStyle(popoverElement, 'overflow-y', 'auto');
    this.renderer.setStyle(popoverElement, 'min-width', '200px');
    this.renderer.setStyle(popoverElement, 'position', 'absolute');
    this.renderer.setStyle(popoverElement, 'z-index', '9999');

    // Create list container
    const list = this.renderer.createElement('div');

    // Add component variables section
    if (componentVariables.length > 0) {
      // Add section header
      const componentHeader = this.renderer.createElement('div');
      this.renderer.setStyle(componentHeader, 'padding', '6px 12px');
      this.renderer.setStyle(componentHeader, 'font-size', '11px');
      this.renderer.setStyle(componentHeader, 'font-weight', '600');
      this.renderer.setStyle(componentHeader, 'color', '#595959ff');
      this.renderer.setStyle(componentHeader, 'background', 'rgba(0, 0, 0, 0.02)');
      this.renderer.setStyle(componentHeader, 'border-bottom', '1px solid #f0f0f0');
      this.renderer.setStyle(componentHeader, 'text-transform', 'uppercase');
      this.renderer.setStyle(componentHeader, 'letter-spacing', '0.5px');
      componentHeader.textContent = this.translateService.instant('componentVariables');
      this.renderer.appendChild(list, componentHeader);

      componentVariables.forEach(variable => {
        const item = this.createVariableItem(variable, popoverElement, false);
        this.renderer.appendChild(list, item);
      });
    }

    // Add system variables section with dimmed background
    if (systemVarsToShow.length > 0) {
      // Add section header
      const header = this.renderer.createElement('div');
      this.renderer.setStyle(header, 'padding', '6px 12px');
      this.renderer.setStyle(header, 'font-size', '11px');
      this.renderer.setStyle(header, 'font-weight', '600');
      this.renderer.setStyle(header, 'color', '#595959ff');
      this.renderer.setStyle(header, 'background', 'rgba(0, 0, 0, 0.08)');
      this.renderer.setStyle(header, 'border-top', '1px solid #e0e0e0');
      this.renderer.setStyle(header, 'border-bottom', '1px solid #f0f0f0');
      this.renderer.setStyle(header, 'text-transform', 'uppercase');
      this.renderer.setStyle(header, 'letter-spacing', '0.5px');
      header.textContent = this.translateService.instant('systemVariables');
      this.renderer.appendChild(list, header);

      systemVarsToShow.forEach(variable => {
        const item = this.createVariableItem(variable, popoverElement, true);
        this.renderer.appendChild(list, item);
      });
    }

    this.renderer.appendChild(popoverElement, list);

    // Position popover
    const buttonRect = this.button.getBoundingClientRect();
    this.renderer.appendChild(document.body, popoverElement);

    // Position below button
    this.renderer.setStyle(popoverElement, 'top', `${buttonRect.bottom + 5}px`);
    this.renderer.setStyle(popoverElement, 'left', `${buttonRect.right - 200}px`);

    // Close on click outside
    const closeOnClickOutside = (e: Event) => {
      if (!popoverElement.contains(e.target as Node) && e.target !== this.button) {
        this.closePopover(popoverElement);
        document.removeEventListener('click', closeOnClickOutside);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', closeOnClickOutside);
    }, 100);

    // Store reference
    this.popover = popoverElement;
  }

  private createVariableItem(variable: string, popoverElement: HTMLElement, isSystemVariable: boolean): HTMLElement {
    const item = this.renderer.createElement('div');
    this.renderer.setStyle(item, 'padding', '8px 12px');
    this.renderer.setStyle(item, 'cursor', 'pointer');
    this.renderer.setStyle(item, 'border-bottom', '1px solid #f0f0f0');
    this.renderer.setStyle(item, 'font-family', 'monospace');
    this.renderer.setStyle(item, 'font-size', '13px');

    // Apply dimmed background for system variables
    if (isSystemVariable) {
      this.renderer.setStyle(item, 'background', 'rgba(0, 0, 0, 0.03)');
    }

    item.textContent = `{{ ${variable} }}`;

    // Hover effect
    this.renderer.listen(item, 'mouseenter', () => {
      this.renderer.setStyle(item, 'background', '#f5f5f5');
    });
    this.renderer.listen(item, 'mouseleave', () => {
      if (isSystemVariable) {
        this.renderer.setStyle(item, 'background', 'rgba(0, 0, 0, 0.03)');
      } else {
        this.renderer.setStyle(item, 'background', 'transparent');
      }
    });

    // Click handler
    this.renderer.listen(item, 'click', () => {
      this.insertVariable(variable);
      this.closePopover(popoverElement);
    });

    return item;
  }

  private closePopover(popoverElement: HTMLElement) {
    if (popoverElement && popoverElement.parentNode) {
      this.renderer.removeChild(document.body, popoverElement);
    }
    this.popover = null;
  }

  private insertVariable(variable: string) {
    const input = this.el.nativeElement;
    const variableText = `{{ ${variable} }}`;

    // Get cursor position
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;

    // Insert variable at cursor position
    const newValue = value.substring(0, start) + variableText + value.substring(end);
    input.value = newValue;

    // Trigger input event to update ngModel
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    // Set cursor position after inserted text
    const newCursorPos = start + variableText.length;
    input.setSelectionRange(newCursorPos, newCursorPos);

    // Focus back on input
    input.focus();
  }

  ngOnDestroy() {
    if (this.popover) {
      this.closePopover(this.popover);
    }
  }
}

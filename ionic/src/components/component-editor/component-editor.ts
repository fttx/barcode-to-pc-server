import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, Content, Events, ViewController } from 'ionic-angular';
import { Config } from '../../config';
import { OutputBlockModel } from '../../models/output-block.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'component-editor',
  templateUrl: 'component-editor.html'
})
export class ComponentEditorComponent implements OnInit {
  @ViewChild(Content) content: Content;
  @Input() outputBlock: OutputBlockModel;
  @Input() locked = false;
  @Input() validated = true;
  public color: string;

  constructor(
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    private events: Events,
    public alertCtrl: AlertController,
    public utils: UtilsProvider,
  ) {
    this.events.subscribe('componentEditor:scrollToTop', () => {
      this.content.scrollToTop();
    });
    this.events.subscribe('componentEditor:scrollToBottom', () => {
      this.content.scrollToBottom();
    });
  }

  ionViewDidLeave() {
    this.events.unsubscribe('componentEditor:scrollToTop');
    this.events.unsubscribe('componentEditor:scrollToBottom');
  }

  ngOnInit(): void {
    this.color = UtilsProvider.GetComponentColor(this.outputBlock);
  }

  public async onCloseClick() {
    if (!this.validated) {
      await this.alertCtrl.create({
        title: await this.utils.text('componentEditorValidationErrorTitle'),
        message: await this.utils.text('componentEditorValidationErrorMessage'),
        buttons: [{
          text: await this.utils.text('componentEditorValidationErrorButton'),
          handler: () => { this.viewCtrl.dismiss(); }
        }],
      }).present();
    } else {
      this.viewCtrl.dismiss();
    }
  }

  public onHelpClick() {
    switch (this.outputBlock.type) {
      case 'barcode': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'key': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'text': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'variable': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'function': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_JAVASCRIPT_FUNCTION); break;
      case 'barcode': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'delay': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'if': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_IF); break;
      case 'endif': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_IF); break;
      case 'http': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_HTTP); break;
      case 'run': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_RUN); break;
      case 'select_option': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'beep': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'csv_lookup': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CSV_LOOKUP); break;
      case 'csv_update': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CSV_UPDATE); break;
      case 'alert': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'woocommerce': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_WOOCOMMERCE); break;
      case 'image': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_IMAGE); break;
      default: this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
    }
  }

  getJavascriptFunctionVariablesInjectionTutorialUrl() {
    return Config.URL_TUTORIAL_JAVASCRIPT_FUNCTION;
  }
}

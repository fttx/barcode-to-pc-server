import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, Content, Events, ViewController } from 'ionic-angular';
import { Config } from '../../config';
import { OutputBlockModel } from '../../models/output-block.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';
import { BtpAlertController } from '../../providers/btp-alert-controller/btp-alert-controller';
import * as oc from '@primer/octicons';
import { DomSanitizer } from '@angular/platform-browser';

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

  octicons = oc;
  iconSVG = null;

  constructor(
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    private events: Events,
    public alertCtrl: BtpAlertController,
    public utils: UtilsProvider,
    public sanitizer: DomSanitizer
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
    if (this.outputBlock.icon) this.iconSVG = this.sanitizer.bypassSecurityTrustHtml(oc[this.outputBlock.icon].toSVG());
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
      case 'key': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/press-key/'); break;
      case 'date_time': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/date_time/'); break;
      case 'variable': this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
      case 'barcode': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/barcode/'); break;
      case 'image': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/image/'); break;
      case 'text': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/text/'); break;
      case 'delay': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/delay/'); break;
      case 'if': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/if/'); break;
      case 'endif': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/endif/'); break;
      case 'function': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/javascript_function/'); break;
      case 'select_option': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/select_option/'); break;
      case 'http': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/http/'); break;
      case 'run': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/run/'); break;
      case 'csv_lookup': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/csv_lookup/'); break;
      case 'csv_update': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/csv_update/'); break;
      case 'google_sheets': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/google_sheets/'); break;
      case 'beep': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/beep/'); break;
      case 'alert': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/alert/'); break;
      case 'woocommerce': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/woocommerce/'); break;
      case 'geolocation': this.electronProvider.shell.openExternal('https://docs.barcodetopc.com/output-template/components/geolocation/'); break;
      default: this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE); break;
    }
  }

  getJavascriptFunctionVariablesInjectionTutorialUrl() {
    return Config.URL_TUTORIAL_JAVASCRIPT_FUNCTION;
  }
}

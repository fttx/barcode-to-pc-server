import { Component, Input } from '@angular/core';
import { Events, Modal, ModalController, ViewController } from 'ionic-angular';
import { OutputBlockModel } from '../../models/output-block.model';
import { ComponentEditorAlertPage } from '../../pages/component-editor/component-editor-alert/component-editor-alert';
import { ComponentEditorBarcodePage } from '../../pages/component-editor/component-editor-barcode/component-editor-barcode';
import { ComponentEditorBeepPage } from '../../pages/component-editor/component-editor-beep/component-editor-beep';
import { ComponentEditorCsvLookupPage } from '../../pages/component-editor/component-editor-csv-lookup/component-editor-csv-lookup';
import { ComponentEditorCsvUpdatePage } from '../../pages/component-editor/component-editor-csv-update/component-editor-csv-update';
import { ComponentEditorDateTimePage } from '../../pages/component-editor/component-editor-date-time/component-editor-date-time';
import { ComponentEditorDelayPage } from '../../pages/component-editor/component-editor-delay/component-editor-delay';
import { ComponentEditorEndifPage } from '../../pages/component-editor/component-editor-endif/component-editor-endif';
import { ComponentEditorFunctionPage } from '../../pages/component-editor/component-editor-function/component-editor-function';
import { ComponentEditorGSheetUpdatePage } from '../../pages/component-editor/component-editor-gsheet-update/component-editor-gsheet-update';
import { ComponentEditorHttpPage } from '../../pages/component-editor/component-editor-http/component-editor-http';
import { ComponentEditorIfPage } from '../../pages/component-editor/component-editor-if/component-editor-if';
import { ComponentEditorKeyPage } from '../../pages/component-editor/component-editor-key/component-editor-key';
import { ComponentEditorRunPage } from '../../pages/component-editor/component-editor-run/component-editor-run';
import { ComponentEditorSelectOptionPage } from '../../pages/component-editor/component-editor-select-option/component-editor-select-option';
import { ComponentEditorTextPage } from '../../pages/component-editor/component-editor-text/component-editor-text';
import { ComponentEditorVariablePage } from '../../pages/component-editor/component-editor-variable/component-editor-variable';
import { ComponentEditorWooCommercePage } from '../../pages/component-editor/component-editor-woocommerce/component-editor-woocommerce';
import { UtilsProvider } from '../../providers/utils/utils';
import { ComponentEditorImagePage } from '../../pages/component-editor/component-editor-image/component-editor-image';
import { ComponentEditorGeolocationPage } from '../../pages/component-editor/component-editor-geolocation/component-editor-geolocation';
import { DomSanitizer } from '@angular/platform-browser';
import * as oc from '@primer/octicons';

@Component({
  selector: 'output-component',
  templateUrl: 'output-component-component.html'
})
export class OutputComponentComponent {
  @Input() outputBlock: OutputBlockModel;

  octicons = oc;
  iconSVG = null;

  static lastModal: Modal;
  static goBackSubscriptionDone = false;

  constructor(
    public modalCtrl: ModalController,
    public events: Events,
    public viewCtrl: ViewController,
    public sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    if (this.outputBlock.icon) this.iconSVG = this.sanitizer.bypassSecurityTrustHtml(oc[this.outputBlock.icon].toSVG());
  }

  onClick(event) {
    event.stopPropagation();
    let editor: any;
    switch (this.outputBlock.type) {
      case 'alert': editor = ComponentEditorAlertPage; break;
      case 'barcode': editor = ComponentEditorBarcodePage; break;
      case 'beep': editor = ComponentEditorBeepPage; break;
      case 'csv_lookup': editor = ComponentEditorCsvLookupPage; break;
      case 'csv_update': editor = ComponentEditorCsvUpdatePage; break;
      case 'google_sheets': editor = ComponentEditorGSheetUpdatePage; break;
      case 'date_time': editor = ComponentEditorDateTimePage; break;
      case 'delay': editor = ComponentEditorDelayPage; break;
      case 'endif': editor = ComponentEditorEndifPage; break;
      case 'function': editor = ComponentEditorFunctionPage; break;
      case 'http': editor = ComponentEditorHttpPage; break;
      case 'if': editor = ComponentEditorIfPage; break;
      case 'key': editor = ComponentEditorKeyPage; break;
      case 'run': editor = ComponentEditorRunPage; break;
      case 'select_option': editor = ComponentEditorSelectOptionPage; break;
      case 'text': editor = ComponentEditorTextPage; break;
      case 'variable': editor = ComponentEditorVariablePage; break;
      case 'woocommerce': editor = ComponentEditorWooCommercePage; break;
      case 'image': editor = ComponentEditorImagePage; break;
      case 'geolocation': editor = ComponentEditorGeolocationPage; break;
    }
    let modal = this.modalCtrl
      .create(editor, { outputBlock: this.outputBlock }, { enableBackdropDismiss: false, showBackdrop: true });
    this.events.subscribe('settings:goBack', () => {
      modal.dismiss();
    });
    modal.onDidDismiss(() => {
      this.events.unsubscribe('settings:goBack');
    });
    modal.present();
  }

  displayedName() {
    return this.outputBlock.name;
  }

  getVariableColor() {
    return UtilsProvider.GetComponentColor(this.outputBlock);
  }
}

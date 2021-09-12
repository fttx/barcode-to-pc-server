import { Component, Input } from '@angular/core';
import { Events, ModalController, ViewController } from 'ionic-angular';
import { OutputBlockModel } from '../../models/output-block.model';
import { ComponentEditorBarcodePage } from '../../pages/component-editor-barcode/component-editor-barcode';
import { ComponentEditorDateTimePage } from '../../pages/component-editor-date-time/component-editor-date-time';
import { ComponentEditorKeyPage } from '../../pages/component-editor-key/component-editor-key';
import { ComponentEditorVariablePage } from '../../pages/component-editor-variable/component-editor-variable';
import { UtilsProvider } from '../../providers/utils/utils';
import { EditOutputBlockPage } from './edit-output-block-pop-over/edit-output-block-pop-over';


@Component({
  selector: 'output-block-component',
  templateUrl: 'output-block-component.html'
})
export class OutputBlockComponent {
  @Input() outputBlock: OutputBlockModel;

  constructor(
    public modalCtrl: ModalController,
    public events: Events,
    public viewCtrl: ViewController,
  ) { }

  onClick(event) {
    event.stopPropagation();
    let editor: any;

    switch (this.outputBlock.type) {
      case 'key': editor = ComponentEditorKeyPage; break;
      case 'date_time': editor = ComponentEditorDateTimePage; break;
      case 'variable': editor = ComponentEditorVariablePage; break;
      case 'barcode': editor = ComponentEditorBarcodePage; break;
      default: editor = EditOutputBlockPage;
    }
    let modal = this.modalCtrl
      .create(editor, { outputBlock: this.outputBlock }, { enableBackdropDismiss: false, showBackdrop: true });
    this.events.subscribe('settings:goBack', () => { modal.dismiss(); });
    modal.onDidDismiss(() => { this.events.unsubscribe('settings:goBack'); })
    modal.present();
  }

  displayedName() {
    return this.outputBlock.name;
  }

  getVariableColor() {
    return UtilsProvider.GetComponentColor(this.outputBlock);
  }
}

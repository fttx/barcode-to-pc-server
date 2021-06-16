import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events, Modal, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { OutputBlockModel } from '../../models/output-block.model';
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
  ) { }

  onClick(event) {
    event.stopPropagation();
    let modal = this.modalCtrl
      .create(EditOutputBlockPage, { outputBlock: this.outputBlock, color: this.getVariableColor() }, { enableBackdropDismiss: false, showBackdrop: true });
    this.events.subscribe('settings:goBack', () => { modal.dismiss(); });
    modal.onDidDismiss(() => { this.events.unsubscribe('settings:goBack'); })
    modal.present();
  }

  displayedName() {
    return this.outputBlock.name;
  }

  getVariableColor() {
    return 'output-block-component-' + this.outputBlock.type // sass variable name: output-block-component-barcode: #... in variables.scss file
  }
}

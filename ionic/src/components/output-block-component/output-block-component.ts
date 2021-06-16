import { Component, Input } from '@angular/core';
import { ModalController } from 'ionic-angular';
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
  ) { }

  onClick(event) {
    event.stopPropagation();
    this.modalCtrl
      .create(EditOutputBlockPage, { outputBlock: this.outputBlock, color: this.getVariableColor() }, {enableBackdropDismiss: false, showBackdrop: true})
      .present();
  }

  displayedName() {
    return this.outputBlock.name;
  }

  getVariableColor() {
    return 'output-block-component-' + this.outputBlock.type // sass variable name: output-block-component-barcode: #... in variables.scss file
  }
}

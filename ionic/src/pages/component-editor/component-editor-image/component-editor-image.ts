import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';

@Component({
  selector: 'page-component-editor-image',
  templateUrl: 'component-editor-image.html',
})
export class ComponentEditorImagePage {
  public outputBlock: OutputBlockModel;
  public enabled = false;

  constructor(
    public navParams: NavParams,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    if (this.outputBlock.outputImagePath) {
      this.enabled = true;
    }
  }
  ionViewDidLeave() {
    if (!this.enabled) {
      this.outputBlock.outputImagePath = null;
    }
  }
}

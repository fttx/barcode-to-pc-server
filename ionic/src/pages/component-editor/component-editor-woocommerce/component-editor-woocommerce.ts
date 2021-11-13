import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';

@Component({
  selector: 'page-component-editor-woocommerce',
  templateUrl: 'component-editor-woocommerce.html',
})
export class ComponentEditorWooCommercePage {
  public outputBlock: OutputBlockModel;

  constructor(
    public navParams: NavParams,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentEditorSelectOptionPage');
  }
}

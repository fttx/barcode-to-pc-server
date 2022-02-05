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

  addField() {
    // Push doesn't work => use assignment
    // this.outputBlock.fields.push({ key: '', value: '' });
    this.outputBlock.fields = [...this.outputBlock.fields, { key: '', value: '' }];
  }

  deleteField(removeIndex: number) {
    this.outputBlock.fields = this.outputBlock.fields.filter((x, index) => index != removeIndex);
  }
}

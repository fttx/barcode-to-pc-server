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

  addField() {
    console.log(this.outputBlock.fields.length);
    //prevent new field if last field is empty
    const lastItem = this.outputBlock.fields.slice(-1)[0];
    if(!(lastItem && lastItem.key === '' && lastItem.value === '')){
      this.outputBlock.fields.push({key: '',value: ''}); 
    }
  }

  deleteField(index: number){
    this.outputBlock.fields.splice(index,1);
  }
}

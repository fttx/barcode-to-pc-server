import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';

@Component({
  selector: 'page-component-editor-alert',
  templateUrl: 'component-editor-alert.html',
})
export class ComponentEditorAlertPage {

  public outputBlock: OutputBlockModel;
  public messagePlaceholder = 'Example: <b>Quantity</b>: {{ google_sheets.qty }}';

  constructor(
    public navParams: NavParams,
  ) {
    console.log('ComponentEditorAlertPage constructor');

    this.outputBlock = this.navParams.get('outputBlock');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentEditorAlertPage');
  }

}

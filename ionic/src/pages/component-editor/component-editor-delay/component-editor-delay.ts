import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';

@Component({
  selector: 'page-component-editor-delay',
  templateUrl: 'component-editor-delay.html',
})
export class ComponentEditorDelayPage {

  public outputBlock: OutputBlockModel;
  constructor(
    public navParams: NavParams,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentEditorDelayPage');
  }

}

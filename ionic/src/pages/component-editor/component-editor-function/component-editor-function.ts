import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';

@Component({
  selector: 'page-component-editor-function',
  templateUrl: 'component-editor-function.html',
})
export class ComponentEditorFunctionPage {

  public outputBlock: OutputBlockModel;
  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider, // template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentEditorFunctionPage');
  }

}

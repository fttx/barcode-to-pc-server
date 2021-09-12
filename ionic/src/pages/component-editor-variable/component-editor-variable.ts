import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../models/output-block.model';

@Component({
  selector: 'page-component-editor-variable',
  templateUrl: 'component-editor-variable.html',
})
export class ComponentEditorVariablePage {
  public outputBlock: OutputBlockModel;

  constructor(
    public navParams: NavParams,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
  }
}

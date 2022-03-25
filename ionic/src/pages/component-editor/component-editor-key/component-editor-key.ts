import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Config } from '../../../config';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';

@Component({
  selector: 'page-component-editor-key',
  templateUrl: 'component-editor-key.html',
})
export class ComponentEditorKeyPage implements OnInit {
  public outputBlock: OutputBlockModel;
  public modifiers: boolean[] = [false, false, false, false];

  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider, // required from template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    this.modifiers[0] = this.outputBlock.modifiers.findIndex(x => x == 'alt') != -1;
    this.modifiers[1] = this.outputBlock.modifiers.findIndex(x => x == 'command') != -1;
    this.modifiers[2] = this.outputBlock.modifiers.findIndex(x => x == 'control') != -1;
    this.modifiers[3] = this.outputBlock.modifiers.findIndex(x => x == 'shift') != -1;
  }

  ngOnInit() {
  }

  onModifierChange() {
    // copy this.modifiers values to the the outputBlock.modifiers
    let modifiers = [];
    if (this.modifiers[0] == true) modifiers.push('alt');
    if (this.modifiers[1] == true) modifiers.push('command');
    if (this.modifiers[2] == true) modifiers.push('control');
    if (this.modifiers[3] == true) modifiers.push('shift');
    this.outputBlock.modifiers = modifiers;
  }

  getUrlSupportedKeyIdentifiersTutorialUrl() {
    return Config.URL_SUPPORTED_KEY_IDENTIFIERS;
  }
}

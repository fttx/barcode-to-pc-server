import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';
import { Config } from '../../../config';


@Component({
  selector: 'edit-output-block-pop-over',
  templateUrl: 'edit-output-block-pop-over.html',
})
export class EditOutputBlockPage {
  public outputBlock: OutputBlockModel;
  public color: string;

  public modifiers: boolean[] = [false, false, false, false];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public ngZone: NgZone,
    private electronProvider: ElectronProvider, // required from the template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
    this.color = this.navParams.get('color');

    if (this.outputBlock.type == 'key') {
      this.modifiers[0] = this.outputBlock.modifiers.findIndex(x => x == 'alt') != -1;
      this.modifiers[1] = this.outputBlock.modifiers.findIndex(x => x == 'command') != -1;
      this.modifiers[2] = this.outputBlock.modifiers.findIndex(x => x == 'control') != -1;
      this.modifiers[3] = this.outputBlock.modifiers.findIndex(x => x == 'shift') != -1;
    }
  }

  onModifierChange() {
    let modifiers = [];
    if (this.modifiers[0] == true) modifiers.push('alt');
    if (this.modifiers[1] == true) modifiers.push('command');
    if (this.modifiers[2] == true) modifiers.push('control');
    if (this.modifiers[3] == true) modifiers.push('shift');
    this.outputBlock.modifiers = modifiers;
  }

  onCloseClick() {
    this.viewCtrl.dismiss();
  }

  getUrlTutorialUseVariables() {
    return Config.URL_TUTORIAL_USE_VARIABLES;
  }
}

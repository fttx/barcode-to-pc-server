import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';

@Component({
  selector: 'page-component-editor-beep',
  templateUrl: 'component-editor-beep.html',
})
export class ComponentEditorBeepPage {

  public outputBlock: OutputBlockModel;
  constructor(
    public navParams: NavParams,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentEditorBeepPage');
  }

  async testAudio() {
    // this code is duplicated on the app side (providers/scan.ts)
    let beepSpeed;
    switch (this.outputBlock.beepSpeed) {
      case 'low': beepSpeed = 700; break;
      case 'medium': beepSpeed = 450; break;
      case 'fast': beepSpeed = 250; break;
    }
    let beep = () => {
      return new Promise<void>((resolve, reject) => {
        let audio = new Audio();
        audio.src = 'assets/audio/' + this.outputBlock.value + '.ogg';
        audio.load();
        audio.play();
        setTimeout(() => { resolve() }, beepSpeed);
      });
    };
    for (let i = 0; i < this.outputBlock.beepsNumber; i++) { await beep(); }
  }
}

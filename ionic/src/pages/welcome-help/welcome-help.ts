import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ViewController } from 'ionic-angular';
import * as os from 'os';
import { Config } from '../../../../electron/src/config';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'page-welcome-help',
  templateUrl: 'welcome-help.html',
})
export class WelcomeHelpPage {
  @ViewChild('slider') slider: Slides;
  public showPrev = false;
  public showNext = true;
  decryptText = UtilsProvider.DecryptText;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public utils: UtilsProvider,
  ) {

  }

  ionViewDidLoad() {

  }

  onSlideChange() {
    this.showPrev = !this.slider.isBeginning();
    this.showNext = !this.slider.isEnd();
  }

  close() {
    this.viewCtrl.dismiss();
  }

  onNextClick() {
    this.slider.slideNext();
  }

  onPrevClick() {
    this.slider.slidePrev();
  }

  onCloseClick() {
    this.viewCtrl.dismiss();
  }

  isWindows() {
    return os.release().toLowerCase().indexOf('windows') != -1;
  }

  onFirewallHelpClick() {
    this.electronProvider.shell.openExternal(Config.URL_WINDOWS_FIREWALL);
  }

  onCommonIssuesClick() {
    this.electronProvider.shell.openExternal(Config.URL_COMMON_ISSUES);
  }

  appName() {
    return Config.APP_NAME;
  }
}

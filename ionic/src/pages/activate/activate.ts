import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { HttpClient } from '@angular/common/http';
import { ElectronProvider } from '../../providers/electron/electron';


/**
 * Generated class for the ActivatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-activate',
  templateUrl: 'activate.html',
})
export class ActivatePage {
  public serial = '';
  public uuid = 'INVALID-UUID';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
    public http: HttpClient,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivatePage');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  getPricingUrl() {
    return Config.URL_PRICING;
  }

  checkActivation() {
    this.http.post(Config.URL_CHECK_SUBSCRIPTION, {
      serial: this.serial,
      uuid: this.electronProvider.uuid
    }).subscribe(value => {
      console.log(value);
    });
  }
}

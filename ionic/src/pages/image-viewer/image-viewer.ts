import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { tap } from 'rxjs/operators';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';
import { TelemetryService } from '../../providers/telemetry/telemetry';

/**
 * Generated class for the ImageViewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-image-viewer',
  templateUrl: 'image-viewer.html',
})
export class ImageViewerPage {

  public imageBase64: string;
  public title: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public utils: UtilsProvider,
    private telemetryProvider: TelemetryService
  ) {
    this.imageBase64 = this.navParams.get('image');
    this.title = this.navParams.get('title');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageViewerPage');
    this.telemetryProvider.sendEvent('page_image_viewer', null, null);
  }

  private domEvents: Subscription;
  ngOnInit(): void {
    this.domEvents = fromEvent(window, 'keyup').pipe(
      tap(event => this.domEvent(event)),
    ).subscribe();
  }
  ngOnDestroy(): void {
    this.domEvents.unsubscribe();
  }

  private destroyed = false;
  domEvent(event) {
    if (event.keyCode && event.keyCode == 27 && !this.destroyed) {
      this.destroyed = true;
      this.navCtrl.pop();
    }
  }

  async exportAsJpeg() {
    const binaryString = window.atob(this.imageBase64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this.title + ".jpg";
    link.click();
  }
}

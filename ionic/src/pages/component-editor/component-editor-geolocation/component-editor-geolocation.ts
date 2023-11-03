import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';
import { UtilsProvider } from '../../../providers/utils/utils';
import { Config } from '../../../config';

@Component({
  selector: 'page-component-editor-geolocation',
  templateUrl: 'component-editor-geolocation.html',
})
export class ComponentEditorGeolocationPage {

  public outputBlock: OutputBlockModel;
  public savedGeoLocations: { name: string, latitude: number, longitude: number }[] = [];

  constructor(
    public navParams: NavParams,
    private utilsProvider: UtilsProvider,
    private electronProvider: ElectronProvider,
    ) {
    this.outputBlock = this.navParams.get('outputBlock');

    this.savedGeoLocations = this.electronProvider.store.get(Config.STORAGE_SAVED_GEOLOCATIONS, []);
  }

  ionViewWillUnload() {
    this.outputBlock.value = Math.random() + ''; // trigger Save & Apply
    // keep only locations that have actual values and that can be converted to numbers
    this.savedGeoLocations = this.savedGeoLocations.filter(x => x.latitude && x.longitude && !isNaN(x.latitude) && !isNaN(x.longitude));
    // convert to numbers
    this.savedGeoLocations = this.savedGeoLocations.map(x => { return { name: x.name, latitude: parseFloat(x.latitude.toString()), longitude: parseFloat(x.longitude.toString()) } });
    // save
    this.electronProvider.store.set(Config.STORAGE_SAVED_GEOLOCATIONS, this.savedGeoLocations);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentEditorGeolocationPage');
  }

  async addSavedLocation() {
    this.savedGeoLocations = [...this.savedGeoLocations, { name: await this.utilsProvider.text('savedLocation') + (this.savedGeoLocations.length + 1).toString(), latitude: null, longitude: null }];
  }

  deleteSavedLocation(removeIndex: number) {
    this.savedGeoLocations = this.savedGeoLocations.filter((x, index) => index != removeIndex);
  }

  onLatitudeChange(index: number) {
    let latitude = (this.savedGeoLocations[index].latitude || 0).toString();
    if (latitude.indexOf(',') > -1) {
      let latitudeLongitude = latitude.split(',');
      this.savedGeoLocations[index].latitude = parseFloat(latitudeLongitude[0] || '0');
      this.savedGeoLocations[index].longitude = parseFloat(latitudeLongitude[1] || '0');
    }
  }

}

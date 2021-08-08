import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import ElectronStore from 'electron-store';
import { AlertController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { ScanModel } from '../../models/scan.model';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../electron/electron';
import { TranslateService } from '@ngx-translate/core';

/*
  Generated class for the UtilsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilsProvider {

  public static DATE_TIME_DEFAULT_FORMATS = [
    { value: "YYYY-MM-DD", title: "YYYY-MM-DD" },
    { value: "YYYY-MM-DD hh:mm", title: "YYYY-MM-DD hh:mm" },
    { value: "YYYY-MM-DD hh:mm:ss", title: "YYYY-MM-DD hh:mm:ss" },
    { value: "LT", title: "Time" },
    { value: "LTS", title: "Time with seconds" },
    { value: "L", title: "Month numeral, day of month, year" },
    { value: "LL", title: "Month name, day of month, year" },
    { value: "LLL", title: "Month name, day of month, year, time	" },
    { value: "LLLL", title: "Month name, day of month, day of week, year, time" },
  ];
  public static DATE_TIME_LOCALES = [
    { id: "af", name: "Afrikaans" },
    { id: "sq", name: "Albanian" },
    { id: "ar", name: "Arabic" },
    { id: "ar-dz", name: "Arabic (Algeria)" },
    { id: "ar-kw", name: "Arabic (Kuwait)" },
    { id: "ar-ly", name: "Arabic (Lybia)" },
    { id: "ar-ma", name: "Arabic (Morocco)" },
    { id: "ar-sa", name: "Arabic (Saudi Arabia)" },
    { id: "ar-tn", name: "Arabic (Tunisia)" },
    { id: "hy-am", name: "Armenian" },
    { id: "az", name: "Azerbaijani" },
    { id: "bm", name: "Bambara" },
    { id: "eu", name: "Basque" },
    { id: "be", name: "Belarusian" },
    { id: "bn", name: "Bengali" },
    { id: "bn-bd", name: "Bengali (Bangladesh)" },
    { id: "bs", name: "Bosnian" },
    { id: "br", name: "Breton" },
    { id: "bg", name: "Bulgarian" },
    { id: "my", name: "Burmese" },
    { id: "km", name: "Cambodian" },
    { id: "ca", name: "Catalan" },
    { id: "tzm", name: "Central Atlas Tamazight" },
    { id: "tzm-latn", name: "Central Atlas Tamazight Latin" },
    { id: "zh-cn", name: "Chinese (China)" },
    { id: "zh-hk", name: "Chinese (Hong Kong)" },
    { id: "zh-mo", name: "Chinese (Macau)" },
    { id: "zh-tw", name: "Chinese (Taiwan)" },
    { id: "cv", name: "Chuvash" },
    { id: "hr", name: "Croatian" },
    { id: "cs", name: "Czech" },
    { id: "da", name: "Danish" },
    { id: "nl", name: "Dutch" },
    { id: "nl-be", name: "Dutch (Belgium)" },
    { id: "en-au", name: "English (Australia)" },
    { id: "en-ca", name: "English (Canada)" },
    { id: "en-in", name: "English (India)" },
    { id: "en-ie", name: "English (Ireland)" },
    { id: "en-il", name: "English (Israel)" },
    { id: "en-nz", name: "English (New Zealand)" },
    { id: "en-sg", name: "English (Singapore)" },
    { id: "en-gb", name: "English (United Kingdom)" },
    { id: "en", name: "English (United States)" },
    { id: "eo", name: "Esperanto" },
    { id: "et", name: "Estonian" },
    { id: "fo", name: "Faroese" },
    { id: "fil", name: "Filipino" },
    { id: "fi", name: "Finnish" },
    { id: "fr", name: "French" },
    { id: "fr-ca", name: "French (Canada)" },
    { id: "fr-ch", name: "French (Switzerland)" },
    { id: "fy", name: "Frisian" },
    { id: "gl", name: "Galician" },
    { id: "ka", name: "Georgian" },
    { id: "de", name: "German" },
    { id: "de-at", name: "German (Austria)" },
    { id: "de-ch", name: "German (Switzerland)" },
    { id: "el", name: "Greek" },
    { id: "gu", name: "Gujarati" },
    { id: "he", name: "Hebrew" },
    { id: "hi", name: "Hindi" },
    { id: "hu", name: "Hungarian" },
    { id: "is", name: "Icelandic" },
    { id: "id", name: "Indonesian" },
    { id: "ga", name: "Irish or Irish Gaelic" },
    { id: "it", name: "Italian" },
    { id: "it-ch", name: "Italian (Switzerland)" },
    { id: "ja", name: "Japanese" },
    { id: "jv", name: "Javanese" },
    { id: "kn", name: "Kannada" },
    { id: "kk", name: "Kazakh" },
    { id: "tlh", name: "Klingon" },
    { id: "gom-deva", name: "Konkani Devanagari script" },
    { id: "gom-latn", name: "Konkani Latin script" },
    { id: "ko", name: "Korean" },
    { id: "ku", name: "Kurdish" },
    { id: "ky", name: "Kyrgyz" },
    { id: "lo", name: "Lao" },
    { id: "lv", name: "Latvian" },
    { id: "lt", name: "Lithuanian" },
    { id: "lb", name: "Luxembourgish" },
    { id: "mk", name: "Macedonian" },
    { id: "ms-my", name: "Malay" },
    { id: "ms", name: "Malay" },
    { id: "ml", name: "Malayalam" },
    { id: "dv", name: "Maldivian" },
    { id: "mt", name: "Maltese (Malta)" },
    { id: "mi", name: "Maori" },
    { id: "mr", name: "Marathi" },
    { id: "mn", name: "Mongolian" },
    { id: "me", name: "Montenegrin" },
    { id: "ne", name: "Nepalese" },
    { id: "se", name: "Northern Sami" },
    { id: "nb", name: "Norwegian Bokmål" },
    { id: "nn", name: "Nynorsk" },
    { id: "oc-lnc", name: "Occitan, lengadocian dialecte" },
    { id: "fa", name: "Persian" },
    { id: "pl", name: "Polish" },
    { id: "pt", name: "Portuguese" },
    { id: "pt-br", name: "Portuguese (Brazil)" },
    { id: "x-pseudo", name: "Pseudo" },
    { id: "pa-in", name: "Punjabi (India)" },
    { id: "ro", name: "Romanian" },
    { id: "ru", name: "Russian" },
    { id: "gd", name: "Scottish Gaelic" },
    { id: "sr", name: "Serbian" },
    { id: "sr-cyrl", name: "Serbian Cyrillic" },
    { id: "sd", name: "Sindhi" },
    { id: "si", name: "Sinhalese" },
    { id: "sk", name: "Slovak" },
    { id: "sl", name: "Slovenian" },
    { id: "es", name: "Spanish" },
    { id: "es-do", name: "Spanish (Dominican Republic)" },
    { id: "es-mx", name: "Spanish (Mexico)" },
    { id: "es-us", name: "Spanish (United States)" },
    { id: "sw", name: "Swahili" },
    { id: "sv", name: "Swedish" },
    { id: "tl-ph", name: "Tagalog (Philippines)" },
    { id: "tg", name: "Tajik" },
    { id: "tzl", name: "Talossan" },
    { id: "ta", name: "Tamil" },
    { id: "te", name: "Telugu" },
    { id: "tet", name: "Tetun Dili (East Timor)" },
    { id: "th", name: "Thai" },
    { id: "bo", name: "Tibetan" },
    { id: "tr", name: "Turkish" },
    { id: "tk", name: "Turkmen" },
    { id: "uk", name: "Ukrainian" },
    { id: "ur", name: "Urdu" },
    { id: "ug-cn", name: "Uyghur (China)" },
    { id: "uz", name: "Uzbek" },
    { id: "uz-latn", name: "Uzbek Latin" },
    { id: "vi", name: "Vietnamese" },
    { id: "cy", name: "Welsh" },
    { id: "yo", name: "Yoruba Nigeria" },
    { id: "ss", name: "siSwati" },
  ];

  private store: ElectronStore;

  constructor(
    private electronProvider: ElectronProvider,
    private alertCtrl: AlertController,
    public storage: Storage,
    private translateService: TranslateService,
  ) {
    this.store = new this.electronProvider.ElectronStore();
  }

  getQrCodeUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.electronProvider.isElectron()) {
        resolve(Config.URL_PAIR + '/?h=' + encodeURIComponent('DEBUG_HOSTNAME') + '&a=' + encodeURIComponent(['127.0.0.1', 'localhost'].join('-')));
        return;
      }

      Promise.all([this.getDefaultLocalAddress(), this.getHostname(), this.getLocalAddresses()]).then((results: any[]) => {
        let defaultLocalAddress = results[0];
        let hostname = results[1];
        let localAddresses = results[2];

        let index = localAddresses.indexOf(defaultLocalAddress);
        if (index > -1) { // removes the defaultLocalAddress from the localAddresses list
          localAddresses.splice(index, 1);
        }
        if (defaultLocalAddress) { // Adds the defaultLocalAddress at very beginning of the list
          localAddresses.unshift(defaultLocalAddress);
        }
        resolve(Config.URL_PAIR + '/?h=' + encodeURIComponent(hostname) + '&a=' + encodeURIComponent(localAddresses.join('-')));
      });
    })
  }

  private getLocalAddresses(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.once('localAddresses', (e, localAddresses) => {
        resolve(localAddresses);
      });
      this.electronProvider.ipcRenderer.send('getLocalAddresses');
    })
  }


  private getDefaultLocalAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.once('defaultLocalAddress', (e, defaultLocalAddress) => {
        resolve(defaultLocalAddress);
      });
      this.electronProvider.ipcRenderer.send('getDefaultLocalAddress');
    })
  }


  private getHostname(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.once('hostname', (e, hostname) => {
        resolve(hostname);
      });
      this.electronProvider.ipcRenderer.send('getHostname');
    })
  }

  public static findIndexFromBottom<T>(array: ReadonlyArray<T>, predicate: (element: T, index: number) => boolean): number {
    for (let i = (array.length - 1); i >= 0; i--) {
      if (predicate(array[i], i)) {
        return i;
      }
    }
    return -1;
  }

  public async showErrorNativeDialog(message: string = '') {
    this.electronProvider.dialog.showMessageBox(null, { // this.electronProvider.remote.getCurrentWindow()
      type: 'error', title: await this.text('nativeErrorDialogTitle'), buttons: [await this.text('nativeErrorDialogCloseButton')], message: message,
    })
  }


  public async showSuccessNativeDialog(message: string = '') {
    this.electronProvider.dialog.showMessageBox(null, {
      type: 'info', title: await this.text('nativeSuccessDialogTitle'), buttons: [await this.text('nativeSuccessDialogCloseButton')], message: message
    })
  }

  public appendParametersToURL(url, data) {
    const ret = [];
    for (let d in data)
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return url + '?' + ret.join('&');
  }

  public upgradeIonicStoreToElectronStore() {
    const SCAN_SESSIONS = "scan_sessions";
    const SETTINGS = "settings";

    let scanSessions = JSON.parse(localStorage.getItem(SCAN_SESSIONS)) || [];
    if (scanSessions.length) {
      this.store.set(Config.STORAGE_SCAN_SESSIONS, scanSessions);
      localStorage.removeItem(SCAN_SESSIONS);
    }

    let settings = JSON.parse(localStorage.getItem(SETTINGS));
    if (settings != null) {
      let newSettings = new SettingsModel();
      Object.keys(settings).forEach(key => {
        newSettings[key] = settings[key];
      })
      this.store.set(Config.STORAGE_SETTINGS, newSettings);
      localStorage.removeItem(SETTINGS);
    }
  }

  public upgradeDisplayValue(requireRestart = false) {
    return new Promise<void>((resolve, reject) => {
      // mark the update as "started"
      this.store.set('upgraded_displayValue', false);

      let alert = this.alertCtrl.create({
        title: 'Updating database',
        message: 'The server database is updating, <b>do not close</b> it.<br><br>It may take few minutes, please wait...',
        enableBackdropDismiss: false,
      });

      // upgrade db
      alert.present();
      let scanSessions = this.store.get(Config.STORAGE_SCAN_SESSIONS, []);
      for (let scanSession of scanSessions) {
        for (let scan of scanSession.scannings) {
          scan.displayValue = ScanModel.ToString(scan);
        }
      }
      this.store.set(Config.STORAGE_SCAN_SESSIONS, JSON.parse(JSON.stringify(scanSessions)));
      alert.dismiss();

      // mark the update as "finished" (true)
      this.store.set('upgraded_displayValue', true);

      if (requireRestart) {
        this.alertCtrl.create({
          title: 'Database update completed',
          message: 'Please restart the server.<br> (Close it from the tray icon)',
          enableBackdropDismiss: false,
        }).present();
      }

      resolve();
    });
  }

  /**
    * Gets the translated value of a key (or an array of keys)
    * @param key
    * @param interpolateParams
    * @returns {string} the translated key, or an object of translated keys
    */
  public async text(key: string | Array<string>, interpolateParams?: Object): Promise<string> {
    return await this.translateService.get(key, interpolateParams).toPromise();
  }
}

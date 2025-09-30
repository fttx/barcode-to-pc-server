import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';
import { lt } from 'semver';
import { Config } from '../../config';
import { NutjsKey, NutjsKeyV482 } from '../../models/nutjs-key.model';
import { OutputBlockModel } from '../../models/output-block.model';
import { OutputProfileModel } from '../../models/output-profile.model';
import { ScanModel } from '../../models/scan.model';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../electron/electron';
import { BtpAlertController } from '../btp-alert-controller/btp-alert-controller';

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

  public static DecryptText: (encoded: string) => any;

  constructor(
    private electronProvider: ElectronProvider,
    private alertCtrl: BtpAlertController,
    public storage: Storage,
    private translateService: TranslateService,
  ) {
    UtilsProvider.DecryptText = UtilsProvider.decrypt('barcodetopc');
    this.electronProvider.ipcRenderer.on('showErrorNativeDialog', async (event, translateStringId, interpolateParams) => {
      const message = await this.text(translateStringId, interpolateParams);
      this.showErrorNativeDialog(message, interpolateParams);
    });
  }

  getQrCodeUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!ElectronProvider.isElectron()) {
        resolve(Config.URL_PAIR + '/?h=' + encodeURIComponent('DEBUG_HOSTNAME') + '&a=' + encodeURIComponent(['127.0.0.1', 'localhost'].join('-')));
        return;
      }

      Promise.all([this.getHostname(), this.getLocalAddresses()]).then((results: any[]) => {
        let hostname = results[0];
        let localAddresses = results[1];
        resolve(Config.URL_PAIR + '/?h=' + encodeURIComponent(hostname) + '&a=' + encodeURIComponent(localAddresses.join('-')));
      });
    })
  }

  private v3DowngradeDialog = null;
  showV3DowngradeDialog() {
    if (this.electronProvider.store.get('disableV3DowngradeDialog', false)) return;
    if (this.v3DowngradeDialog != null) return;
    this.v3DowngradeDialog = this.alertCtrl.create({
      cssClass: 'changelog',
      title: 'Data loss warning',
      message: 'The server has been updated to version v4.1.0. <br>The app update will be released within the next month.<br><br>\
      Due to incompatibility issues Android users won\'t be able to retain the data and settings stored on the smartphone after updating the mobile app from v3.x.x to v4.x.x, so please sync it before updating.\
      Alternatively, disable automatic updates from the PlayStore and keep using the v3.18.x version of the app that is still fully compatible with v4.x.x.',
      inputs: [{
        type: 'checkbox',
        label: 'Do not show this message again',
        value: 'doNotShowAgain',
        checked: false,
      }],
      buttons: [
        {
          text: 'Ignore',
          handler: (data) => {
            if (data == 'doNotShowAgain') {
              this.storage.set('disableV3DowngradeDialog', true);
            }
          }
        },
        {
          text: 'Get help',
          handler: (data) => {
            if (data == 'doNotShowAgain') {
              this.storage.set('disableV3DowngradeDialog', true);
            }
            this.electronProvider.shell.openExternal(Config.URL_DOWNGRADE_V3);
          }
        }
      ]
    });
    this.v3DowngradeDialog.present();
  }

  upgradeTemplate(outputTemplate: OutputProfileModel, version): OutputProfileModel {
    const result: OutputProfileModel = JSON.parse(JSON.stringify(outputTemplate));
    if (lt(version, '4.1.0')) {
      // Robotjs to Nutjs
      for (let i = 0; i < result.outputBlocks.length; i++) {
        const outputBlock = result.outputBlocks[i];
        if (outputBlock.type == 'key' && typeof outputBlock.modifierKeys == 'undefined') {
          outputBlock.name = 'PRESS KEY';
          outputBlock.keyId = UtilsProvider.RobotjsToNutjs(outputBlock.value);
          if (outputBlock.keyId == NutjsKey.Enter) {
            outputBlock.name = 'ENTER'
          } else if (outputBlock.keyId == NutjsKey.Tab) {
            outputBlock.name = 'TAB'
          }
          outputBlock.modifierKeys = [];
          for (let j = 0; j < outputBlock.modifiers.length; j++) {
            const modifier = outputBlock.modifiers[j];
            switch (modifier) {
              case 'alt': outputBlock.modifierKeys.push(NutjsKey.LeftAlt); break;
              case 'command': outputBlock.modifierKeys.push(NutjsKey.LeftSuper); break;
              case 'control': outputBlock.modifierKeys.push(NutjsKey.LeftControl); break;
              case 'shift': outputBlock.modifierKeys.push(NutjsKey.LeftShift); break;
            }
          }
        }
      }
    }
    return result;
  }

  private getLocalAddresses(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.on('localAddresses', (e, localAddresses) => {
        resolve(localAddresses);
      });
      this.electronProvider.ipcRenderer.send('getLocalAddresses');
    })
  }

  private getHostname(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electronProvider.ipcRenderer.on('hostname', (e, hostname) => {
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

  public async showErrorNativeDialog(message: string = '', interpolateParams?: Object) {
    this.electronProvider.showMessageBoxSync({
      type: 'error', title: await this.text('nativeErrorDialogTitle'), buttons: [await this.text('nativeErrorDialogCloseButton', interpolateParams)], message: message,
    })
  }


  public async showSuccessNativeDialog(message: string = '') {
    this.electronProvider.showMessageBoxSync({
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
      this.electronProvider.store.set(Config.STORAGE_SCAN_SESSIONS, scanSessions);
      localStorage.removeItem(SCAN_SESSIONS);
    }

    let settings = JSON.parse(localStorage.getItem(SETTINGS));
    if (settings != null) {
      let newSettings = new SettingsModel(UtilsProvider.GetOS());
      Object.keys(settings).forEach(key => {
        newSettings[key] = settings[key];
      })
      this.electronProvider.store.set(Config.STORAGE_SETTINGS, newSettings);
      localStorage.removeItem(SETTINGS);
    }
  }

  public upgradeDisplayValue(requireRestart = false) {
    return new Promise<void>((resolve, reject) => {
      // mark the update as "started"
      this.electronProvider.store.set('upgraded_displayValue', false);

      let alert = this.alertCtrl.create({
        title: 'Updating database',
        message: 'The server database is updating, <b>do not close</b> it.<br><br>It may take few minutes, please wait...',
        enableBackdropDismiss: false,
      });

      // upgrade db
      alert.present();
      let scanSessions = this.electronProvider.store.get(Config.STORAGE_SCAN_SESSIONS, []);
      for (let scanSession of scanSessions) {
        for (let scan of scanSession.scannings) {
          scan.displayValue = ScanModel.ToString(scan);
        }
      }
      this.electronProvider.store.set(Config.STORAGE_SCAN_SESSIONS, JSON.parse(JSON.stringify(scanSessions)));
      alert.dismiss();

      // mark the update as "finished" (true)
      this.electronProvider.store.set('upgraded_displayValue', true);

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

  /**
   * Creates a cipher
   * Usage:
   *  const c = encrypt('key');
   *  e = c('plaintext');
   * @param salt
   * @returns
   */
  public static encrypt(salt: string) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);

    return text => text.split('')
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
  }

  /**
   * Creates a cipher
   * Usage:
   *  const c = decrypt('key');
   *  p = c('encryptedtext');
   * @param salt
   * @returns
   */
  public static decrypt(salt: string) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
  }

  public static GetComponentColor(outputComponent: OutputBlockModel) {
    // sass variable name: output-block-component-barcode: #... in variables.scss file
    return 'output-block-component-' + outputComponent.type;
  }

  public static GetOS() {
    if (!ElectronProvider.isElectron()) return "browser";
    return window.preload.os.platform().toLowerCase();
  }

  public static RobotjsToNutjs(robotjs: string): NutjsKey {
    switch (robotjs) {
      case 'backspace': return NutjsKey.Backspace;
      case 'delete': return NutjsKey.Delete;
      case 'enter': return NutjsKey.Enter;
      case 'tab': return NutjsKey.Tab;
      case 'escape': return NutjsKey.Escape;
      case 'up': return NutjsKey.Up;
      case 'down': return NutjsKey.Down;
      case 'right': return NutjsKey.Right;
      case 'left': return NutjsKey.Left;
      case 'home': return NutjsKey.Home;
      case 'end': return NutjsKey.End;
      case 'pageup': return NutjsKey.PageUp;
      case 'pagedown': return NutjsKey.PageDown;
      case 'f1': return NutjsKey.F1;
      case 'f2': return NutjsKey.F2;
      case 'f3': return NutjsKey.F3;
      case 'f4': return NutjsKey.F4;
      case 'f5': return NutjsKey.F5;
      case 'f6': return NutjsKey.F6;
      case 'f7': return NutjsKey.F7;
      case 'f8': return NutjsKey.F8;
      case 'f9': return NutjsKey.F9;
      case 'f10': return NutjsKey.F10;
      case 'f11': return NutjsKey.F11;
      case 'f12': return NutjsKey.F12;
      case 'command': return NutjsKey.LeftSuper;
      case 'alt': return NutjsKey.LeftAlt;
      case 'control': return NutjsKey.LeftControl;
      case 'shift': return NutjsKey.LeftShift;
      case 'right_shift': return NutjsKey.RightShift;
      case 'space': return NutjsKey.Space;
      case 'printscreen': return NutjsKey.Space;
      case 'insert': return NutjsKey.Insert;
      case 'audio_mute': return NutjsKey.AudioMute;
      case 'audio_vol_down': return NutjsKey.AudioVolDown;
      case 'audio_vol_up': return NutjsKey.AudioVolUp;
      case 'audio_play': return NutjsKey.AudioPlay;
      case 'audio_stop': return NutjsKey.AudioStop;
      case 'audio_pause': return NutjsKey.AudioPause;
      case 'audio_prev': return NutjsKey.AudioPrev;
      case 'audio_next': return NutjsKey.AudioNext;
      case 'audio_rewind': return NutjsKey.AudioRewind;
      case 'audio_forward': return NutjsKey.AudioForward;
      case 'audio_repeat': return NutjsKey.AudioRepeat;
      case 'audio_random': return NutjsKey.AudioRandom;
      case 'numpad_0': return NutjsKey.NumPad0;
      case 'numpad_1': return NutjsKey.NumPad1;
      case 'numpad_2': return NutjsKey.NumPad2;
      case 'numpad_3': return NutjsKey.NumPad3;
      case 'numpad_4': return NutjsKey.NumPad4;
      case 'numpad_5': return NutjsKey.NumPad5;
      case 'numpad_6': return NutjsKey.NumPad6;
      case 'numpad_7': return NutjsKey.NumPad7;
      case 'numpad_8': return NutjsKey.NumPad8;
      case 'numpad_9': return NutjsKey.NumPad9;
      case 'lights_mon_up': return NutjsKey.Space;
      case 'lights_mon_down': return NutjsKey.Space;
      case 'lights_kbd_toggle': return NutjsKey.Space;
      case 'lights_kbd_up': return NutjsKey.Space;
      case 'lights_kbd_down': return NutjsKey.Space;
    }

    switch (robotjs.toUpperCase()) {
      case 'A': return NutjsKey.A;
      case 'B': return NutjsKey.B;
      case 'C': return NutjsKey.C;
      case 'D': return NutjsKey.D;
      case 'E': return NutjsKey.E;
      case 'F': return NutjsKey.F;
      case 'G': return NutjsKey.G;
      case 'H': return NutjsKey.H;
      case 'I': return NutjsKey.I;
      case 'J': return NutjsKey.J;
      case 'K': return NutjsKey.K;
      case 'L': return NutjsKey.L;
      case 'M': return NutjsKey.M;
      case 'N': return NutjsKey.N;
      case 'O': return NutjsKey.O;
      case 'P': return NutjsKey.P;
      case 'Q': return NutjsKey.Q;
      case 'R': return NutjsKey.R;
      case 'S': return NutjsKey.S;
      case 'T': return NutjsKey.T;
      case 'U': return NutjsKey.U;
      case 'V': return NutjsKey.V;
      case 'W': return NutjsKey.W;
      case 'X': return NutjsKey.X;
      case 'Y': return NutjsKey.Y;
      case 'Z': return NutjsKey.Z;
    }
    return NutjsKey.Space;
  }


  mapNutjsKeyToNutjsKeyV482(outputBlock: OutputBlockModel) {
    // Update the nutjs key identifiers
    if (outputBlock.name === 'ENTER') outputBlock.keyId = NutjsKey.Enter;
    if (outputBlock.name === 'TAB') outputBlock.keyId = NutjsKey.Tab;
    if (outputBlock.name === 'PRESS KEY') {
      const oldId = outputBlock.keyId;
      const keyMappings = {
        [NutjsKeyV482.Enter]: NutjsKey.Enter,
        [NutjsKeyV482.Tab]: NutjsKey.Tab,
        [NutjsKeyV482.Space]: NutjsKey.Space,
        [NutjsKeyV482.Backspace]: NutjsKey.Backspace,
        [NutjsKeyV482.Delete]: NutjsKey.Delete,
        [NutjsKeyV482.Escape]: NutjsKey.Escape,
        [NutjsKeyV482.Up]: NutjsKey.Up,
        [NutjsKeyV482.Down]: NutjsKey.Down,
        [NutjsKeyV482.Left]: NutjsKey.Left,
        [NutjsKeyV482.Right]: NutjsKey.Right,
        [NutjsKeyV482.Home]: NutjsKey.Home,
        [NutjsKeyV482.End]: NutjsKey.End,
        [NutjsKeyV482.PageUp]: NutjsKey.PageUp,
        [NutjsKeyV482.PageDown]: NutjsKey.PageDown,
      }
      outputBlock.keyId = keyMappings[oldId] || oldId;
    }
  }

  /**
   * Process user authentication from base64 data and store user info
   * @param base64Data Base64 encoded user data
   * @param source Source of authentication ('deeplink' or 'fallback')
   * @returns {email: string, name: string} if successful, null if failed
   */
  public processUserAuthentication(base64Data: string, source: string): { email: string, name: string } | null {
    try {
      // Decode base64 data
      const decodedData = atob(base64Data.trim());
      const userData = JSON.parse(decodedData);

      // Validate required fields
      if (!userData.email || !userData.name) {
        console.error('[auth] Invalid user data - missing email or name');
        return null;
      }

      // Store user data for telemetry
      localStorage.setItem('email', userData.email);
      localStorage.setItem('name', userData.name);

      console.log(`[auth] User authenticated via ${source}:`, { email: userData.email, name: userData.name });

      return {
        email: userData.email,
        name: userData.name
      };
    } catch (error) {
      console.error('[auth] Error processing user authentication:', error);
      return null;
    }
  }

  /**
   * Show success feedback for user authentication
   * @param userData User data object with name
   */
  public async showAuthSuccessFeedback(userData: { name: string }): Promise<void> {
    if (window.confetti_v2) {
      const welcomeMessage = await this.text('welcomeConfetti', { name: userData.name });
      window.confetti_v2(welcomeMessage);
    }
  }

}

import { Injectable } from '@angular/core';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigProvider {

  public static WEB_SITE_NAME = 'barcodetopc.com';

  public static URL_WEBSITE = 'https://barcodetopc.com/';
  public static URL_DOWNLOAD = 'https://barcodetopc.com/#download';
  public static URL_FAQ = 'https://barcodetopc.com/faq.html';
  public static URL_FAQ_APP_DOESNT_FIND_COMPUTER = 'https://barcodetopc.com/faq.html#app-doesnt-find-computer';
  public static URL_API = "https://barcodetopc.com/http-api.json"
  public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
  public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';
  public static URL_MAIL = 'mailto:filippo.tortomasi@gmail.com';

  public static CONNECT_URL_BASE = 'http://app.barcodetopc.com';

  public static APP_NAME = "Barcode To PC";

  constructor() { }

}

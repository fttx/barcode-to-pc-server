import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {

  public static WEB_SITE_NAME = 'barcodetopc.com';

  public static URL_WEBSITE = 'https://barcodetopc.com/';
  public static URL_DOWNLOAD = 'https://barcodetopc.com/#download';
  public static URL_FAQ = 'https://barcodetopc.com/faq.html';
  public static URL_API = "https://barcodetopc.com/http-api.json"
  public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
  public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';
  public static URL_MAIL = 'mailto:filippo.tortomasi@gmail.com';

  public static CONNECT_URL_BASE = 'http://app.barcodetopc.com';

  constructor() { }

}

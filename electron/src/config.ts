import { BrowserWindowConstructorOptions } from 'electron';

export class Config {
    public static APP_NAME = 'Barcode to PC server';
    public static PORT = 57891;
    public static IS_DEV_MODE = process.argv.slice(1).some(val => val === '--dev');
    public static IS_TEST_MODE = process.argv.slice(1).some(val => val === '--test');
    public static AUTHOR = 'Filippo Tortomasi';
    public static WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
        width: 1024, height: 720,
        minWidth: 800, minHeight: 600,
        title: Config.APP_NAME,
    };

    public static WEB_SITE_NAME = 'barcodetopc.com';

    public static URL_WEBSITE = 'https://barcodetopc.com/';
    public static URL_DOWNLOAD = 'https://barcodetopc.com/#download';
    public static URL_FAQ = 'https://barcodetopc.com/faq.html';
    public static URL_FAQ_APP_DOESNT_FIND_COMPUTER = 'https://barcodetopc.com/faq.html#app-doesnt-find-computer';
    public static URL_API = "https://barcodetopc.com/http-api.json"
    public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
    public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';
    public static URL_MAIL = 'mailto:filippo.tortomasi@gmail.com';

    public static URL_PAIR = 'http://app.barcodetopc.com';


}
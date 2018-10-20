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

    // public static URL_WEBSITE = 'https://barcodetopc.com';
    public static URL_WEBSITE = 'http://localhost/wordpress/site';

    // public static URL_LICENSE_SERVER = 'https://license.barcodetopc.com';
    public static URL_LICENSE_SERVER = 'http://localhost:3000'
    public static URL_CHECK_SUBSCRIPTION = Config.URL_LICENSE_SERVER + '/subscription/check';

    // public static URL_BLOG = 'https://blog.barcodetopc.com';
    public static URL_BLOG = 'http://localhost/wordpress';

    public static URL_PRICING = Config.URL_BLOG + '/pricing/';
    public static URL_DOWNLOAD = Config.URL_WEBSITE + '/#download';
    public static URL_FAQ = Config.URL_WEBSITE + '/faq.html';
    public static URL_FAQ_APP_DOESNT_FIND_COMPUTER = Config.URL_WEBSITE + '/faq.html#app-doesnt-find-computer';
    public static URL_API = Config.URL_WEBSITE + "http-api.json"
    public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
    public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';
    public static URL_MAIL = 'mailto:filippo.tortomasi@gmail.com';

    public static URL_PAIR = 'http://app.barcodetopc.com';


    // Constants
    public static STORAGE_SUBSCRIPTION = 'subscription';
    public static STORAGE_SERIAL = 'serial';
    public static STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE = 'storage_first_license_check_fail_date';
    public static STORAGE_MONTHLY_SCANS_COUNT = 'storage_monthly_scans_count';
    public static STORAGE_NEXT_CHARGE_DATE = 'storage_next_charge_date';
}
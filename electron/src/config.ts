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

    public static URL_WEBSITE = 'https://barcodetopc.com';

    public static URL_LICENSE_SERVER = 'https://license.barcodetopc.com';
    public static URL_ORDER_CHECK = Config.URL_LICENSE_SERVER + '/order/check';
    public static URL_ORDER_DEACTIVATE = Config.URL_LICENSE_SERVER + '/order/remove';

    public static URL_PRICING = Config.URL_WEBSITE + '/pricing/';
    public static URL_DOWNLOAD = Config.URL_WEBSITE + '/#download';
    public static URL_FAQ = Config.URL_WEBSITE + '/frequently-asked-questions/';
    public static URL_FAQ_APP_DOESNT_FIND_COMPUTER = Config.URL_FAQ + '#app-doesnt-find-computer';
    public static URL_API = Config.URL_WEBSITE + "http-api.json"
    public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
    public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';

    public static URL_PAIR = 'http://app.barcodetopc.com';

    public static EMAIL_SUPPORT = 'support@barcodetopc.com';
    public static EMAIL_FASTSPRING = 'orders@fastspring.com';

    // Constants
    public static STORAGE_SUBSCRIPTION = 'subscription';
    public static STORAGE_SERIAL = 'serial';
    public static STORAGE_FIRST_LICENSE_CHECK_FAIL_DATE = 'storage_first_license_check_fail_date'; // contains the date of the first time that the license check failed to receive a vaild response (eg. no internet connection)
    public static STORAGE_MONTHLY_SCAN_COUNT = 'storage_monthly_scan_count';
    public static STORAGE_LAST_SCAN_COUNT_RESET_DATE = 'storage_last_scan_count_reset_date';
    public static STORAGE_NEXT_CHARGE_DATE = 'storage_next_charge_date';
    public static STORAGE_FIRST_CONNECTION_DATE = 'storage_first_connection_date';
    public static STORAGE_SCAN_SESSIONS = 'storage_scan_sessions';
    public static STORAGE_SETTINGS = 'storage_settings';
    public static STORAGE_LAST_VERSION = 'storage_last_version';
}
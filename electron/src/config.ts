import { BrowserWindowConstructorOptions } from 'electron';

export class Config {
    public static APP_NAME = 'Barcode to PC server';
    public static PORT = 57891;
    public static IS_DEV_MODE = process.argv.slice(1).some(val => val === '--dev');
    public static IS_TEST_MODE = process.argv.slice(1).some(val => val === '--test');
    public static AUTHOR = 'Filippo Tortomasi';
    public static WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
        width: 1024, height: 768,
        minWidth: 800, minHeight: 600,
        title: Config.APP_NAME,
    };

    public static DEFAULT_COMPONENT_TIMEOUT = 10000;

    public static WEBSITE_NAME = 'barcodetopc.com';

    public static URL_WEBSITE = 'https://barcodetopc.com';
    public static URL_PLAYSTORE = 'https://play.google.com/store/apps/details?id=com.barcodetopc';
    public static URL_APPSTORE = 'https://itunes.apple.com/app/id1180168368';

    public static URL_LICENSE_SERVER = 'https://license.barcodetopc.com';
    public static URL_ORDER_CHECK = Config.URL_LICENSE_SERVER + '/order/check';
    public static URL_ORDER_DEACTIVATE = Config.URL_LICENSE_SERVER + '/order/remove';

    public static URL_PRICING = Config.URL_WEBSITE + '/pricing/';
    public static URL_DOWNLOAD_SERVER = Config.URL_WEBSITE + '/#download-server';
    public static URL_WINDOWS_FIREWALL = Config.URL_WEBSITE + '/settings/configure-windows-firewall/';
    public static URL_COMMON_ISSUES = Config.URL_WEBSITE + '/settings/common-issues/';
    public static URL_FAQ = Config.URL_WEBSITE + '/frequently-asked-questions/';
    public static URL_SUPPORTED_KEY_IDENTIFIERS = Config.URL_WEBSITE + '/supported-key-identifiers/';
    public static URL_SUPPORTED_DATE_FORMATS = Config.URL_WEBSITE + '/supported-date-formats/';
    public static URL_API = Config.URL_WEBSITE + "http-api.json"
    public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
    public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';
    public static URL_ORDERS_SUPPORT = 'https://questionacharge.com/';
    public static URL_GITHUB_CHANGELOG = 'https://raw.githubusercontent.com/fttx/barcode-to-pc-server/master/CHANGELOG.md';

    public static URL_TUTORIAL_KEYBOARD_EMULATION = Config.URL_WEBSITE + '/tutorial/keyboard-emulation/';
    public static URL_TUTORIAL_JAVASCRIPT_FUNCTION = Config.URL_WEBSITE + '/tutorial/how-to-use-the-javascript-function-component/';
    public static URL_TUTORIAL_IF = Config.URL_WEBSITE + '/tutorial/use-conditions-in-the-output-template/';
    public static URL_TUTORIAL_RUN = Config.URL_WEBSITE + '/tutorial/how-to-use-the-run-output-component/';
    public static URL_TUTORIAL_RUN_PASS_PARAMETER = Config.URL_WEBSITE + '/tutorial/how-to-use-the-run-output-component/#pass-parameters';
    public static URL_TUTORIAL_CSV_LOOKUP = Config.URL_WEBSITE + '/tutorial/how-to-use-the-csv_lookup-component';
    public static URL_TUTORIAL_CSV_UPDATE = Config.URL_WEBSITE + '/tutorial/how-to-use-the-csv_update-component';
    public static URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE = Config.URL_WEBSITE + '/tutorial/how-to-create-output-templates/';
    public static URL_TUTORIAL_MACOS_ACCESSIBILITY = Config.URL_WEBSITE + '/tutorial/give-accessibility-permissions-to-barcode-to-pc/';

    public static URL_PAIR = 'http://app.barcodetopc.com';

    public static EMAIL_SUPPORT = 'support@barcodetopc.com';

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
    public static STORAGE_LICENSE_EVER_ACTIVATED = 'storage_license_ever_activated';
}

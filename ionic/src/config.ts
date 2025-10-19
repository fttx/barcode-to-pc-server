export class Config {
  public static APP_NAME = 'Barcode to PC server';
  public static PORT = 57891;
  public static OAUTH_HTTP_PORT = Config.PORT + 1;
  public static AUTHOR = 'Filippo Tortomasi';

  public static DEFAULT_COMPONENT_TIMEOUT = 10000;

  public static WEBSITE_NAME = 'barcodetopc.com';

  public static URL_WEBSITE = 'https://barcodetopc.com';
  public static URL_PLAYSTORE = 'https://play.google.com/store/apps/details?id=com.barcodetopc';
  public static URL_APPSTORE = 'https://itunes.apple.com/app/id1180168368';

  public static URL_LOGIN = 'https://auth.barcodetopc.com/login';

  public static URL_LICENSE_SERVER_CHECK = 'https://license.barcodetopc.com/';
  public static URL_LICENSE_SERVER = 'https://license.barcodetopc.com/v5';
  public static URL_AI_ENDPOINT = 'https://license.barcodetopc.com';
  // public static URL_LICENSE_SERVER = 'http://192.168.0.36:3000/v5';
  // public static URL_AI_ENDPOINT = 'http://192.168.0.36:3000';

  public static URL_TELEMETRY = Config.URL_LICENSE_SERVER + '/telemetry';
  public static URL_ORDER_CHECK = Config.URL_LICENSE_SERVER + '/order/check';
  public static URL_ORDER_DEACTIVATE = Config.URL_LICENSE_SERVER + '/order/remove';

  public static URL_PRICING = Config.URL_WEBSITE + '/pricing/';
  public static URL_V4 = Config.URL_WEBSITE + '/updates/v4/#why-upgrade-the-license';
  public static URL_V3 = Config.URL_WEBSITE + '/updates/v4/#v3';
  public static URL_DOWNLOAD_SERVER = Config.URL_WEBSITE + '/download';
  public static URL_WINDOWS_FIREWALL = Config.URL_WEBSITE + '/settings/configure-windows-firewall/';
  public static URL_COMMON_ISSUES = Config.URL_WEBSITE + '/settings/common-issues/';
  public static URL_FAQ = Config.URL_WEBSITE + '/frequently-asked-questions/';
  public static URL_SUPPORTED_DATE_FORMATS = Config.URL_WEBSITE + '/supported-date-formats/';
  public static URL_API = Config.URL_WEBSITE + "http-api.json"
  public static URL_GITHUB_SERVER = 'https://github.com/fttx/barcode-to-pc-server';
  public static URL_GITHUB_APP = 'https://github.com/fttx/barcode-to-pc-app';
  public static URL_ORDERS_SUPPORT = 'https://barcodetopc.com/invoicing/';
  public static URL_GITHUB_CHANGELOG = 'https://raw.githubusercontent.com/fttx/barcode-to-pc-server/master/CHANGELOG.md';

  public static URL_TUTORIAL_KEYBOARD_EMULATION = 'https://docs.barcodetopc.com/keyboard-emulation/';
  public static URL_TUTORIAL_JAVASCRIPT_FUNCTION = 'https://docs.barcodetopc.com/output-template/components/javascript_function/';
  public static URL_TUTORIAL_INJECTION = 'https://docs.barcodetopc.com/output-template/inject-variables/';
  public static URL_TUTORIAL_IF = 'https://docs.barcodetopc.com/output-template/components/if/';
  public static URL_TUTORIAL_RUN = 'https://docs.barcodetopc.com/output-template/components/run/';
  public static URL_TUTORIAL_CSV_LOOKUP = 'https://docs.barcodetopc.com/output-template/components/csv_lookup/';
  public static URL_TUTORIAL_CSV_UPDATE = 'https://docs.barcodetopc.com/output-template/components/csv_update/';
  public static URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE = 'https://docs.barcodetopc.com/output-template/how-it-works/';
  public static URL_TUTORIAL_MACOS_ACCESSIBILITY = 'https://docs.barcodetopc.com/keyboard-emulation/#nothing-gets-type-macos-only';
  public static URL_TUTORIAL_HTTP = 'https://docs.barcodetopc.com/output-template/components/http_request/';
  public static URL_TUTORIAL_WOOCOMMERCE = 'https://docs.barcodetopc.com/output-template/components/woocommerce/';
  public static URL_TUTORIAL_IMAGE = 'https://docs.barcodetopc.com/output-template/components/image/';
  public static URL_DOWNGRADE_V3 = Config.URL_WEBSITE + '/downgrade-app-from-v4-to-v3/';

  public static URL_PAIR = 'https://app.barcodetopc.com';

  public static EMAIL_SUPPORT = 'support@barcodetopc.com';

  public static INCENTIVE_EMAIL_SHOW_THRESHOLD = 10;


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
  public static STORAGE_SAVED_GEOLOCATIONS = 'storage_saved_geolocations';

  public static GAPIS_CREDENTIALS = {
    // 1. Generate credentials: https://console.cloud.google.com/apis/
    // 2. Create OAuth page and set spreadsheets and drive.metadata.readonly scopes
    "client_id": "162261435624-mpjie85srspdo0nsbsr72nfcibp8c8sf.apps.googleusercontent.com",
    "project_id": "ace-scarab-366420",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "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",
    "redirect_uri": "https://barcodetopc.com/oauth",
    "javascript_origins": [
      "https://barcodetopc.com"
    ]
  };
  public static BTPLINK_PROTOCOL = "btplink";
}

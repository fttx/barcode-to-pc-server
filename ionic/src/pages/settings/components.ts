import { NutjsKey } from '../../models/nutjs-key.model';
import moment from 'moment';
import { OutputBlockModel } from '../../models/output-block.model';

// Collect data from the app
export const data_collection: OutputBlockModel[] = [
  { name: 'DATE_TIME',           value: '',                  type: 'date_time',     skipOutput: false,  label: null,  format: 'YYYY-MM-DD',  locale: moment.locale(),  matchBarcodeDate: true },
  { name: 'TIMESTAMP',           value: 'timestamp',         type: 'variable',      skipOutput: false,  label: null },
  { name: 'SCAN_SESSION_NAME',   value: 'scan_session_name', type: 'variable',      skipOutput: false,  label: null },
  { name: 'DEVICE_NAME',         value: 'deviceName',        type: 'variable',      skipOutput: false,  label: null },
  { name: 'NUMBER',              value: 'number',            type: 'variable',      skipOutput: false,  label: null,  filter: null,          errorMessage: null,       defaultValue: '1' },
  { name: 'TEXT',                value: 'text',              type: 'variable',      skipOutput: false,  label: null,  filter: null,          errorMessage: null,       defaultValue: null },
  { name: 'BARCODE',             value: 'BARCODE',           type: 'barcode',       skipOutput: false,  label: null,  enabledFormats: [],    filter: null,            errorMessage: null },
  { name: 'IMAGE',               value: '',                  type: 'image',         outputImagePath: '', imageHd: false },
  { name: 'SELECT_OPTION',       value: '',                  type: 'select_option', skipOutput: false,  label: null, title: '',              message: '' },
  { name: 'GEOLOCATION',         value: '',                  type: 'geolocation',   outputMode: 'coordinates', maxDistanceFromSavedLocation: 1, skipOutput: false, label: null },
  { name: 'STATIC_TEXT',         value: '',                  type: 'text',          skipOutput: false,  label: null },
]

// Control the flow
export const flow_control: OutputBlockModel[] = [
  { name: 'IF',                  value: '',                  type: 'if' },
  { name: 'ENDIF',               value: 'endif',             type: 'endif' },
  { name: 'DELAY',               value: '',                  type: 'delay' },
]

// Keyboard emulation and other outputs
export const keyboard_actions: OutputBlockModel[] = [
  { name: 'PRESS KEY',           value: '',                  type: 'key',           keyId: NutjsKey.Space,     modifierKeys: [] },
  { name: 'ENTER',               value: '',                  type: 'key',           keyId: NutjsKey.Enter,     modifierKeys: [] },
  { name: 'TAB',                 value: '',                  type: 'key',           keyId: NutjsKey.Tab,       modifierKeys: [] },
]

// Functions executed remotely
export const functions: OutputBlockModel[] = [
  { name: 'JAVASCRIPT_FUNCTION', value: '',                  type: 'function',      allowOOBExecution: false, skipOutput: false, label: null },
  { name: 'HTTP_REQUEST',        value: '',                  type: 'http',          allowOOBExecution: true,  skipOutput: false, label: null, httpMethod: 'get', httpData: null, httpParams: null, httpHeaders: null, httpOAuthMethod: 'disabled', httpOAuthConsumerKey: null, httpOAuthConsumerSecret: null, timeout: 10000 },
  { name: 'RUN',                 value: '',                  type: 'run',           allowOOBExecution: true,  skipOutput: false, label: null, timeout: 10000 },
  { name: 'CSV_LOOKUP',          value: '{{ barcode }}',     type: 'csv_lookup',    allowOOBExecution: true,  skipOutput: false, label: null, csvFile: '', searchColumn: 1, resultColumn: 2, notFoundValue: '', delimiter: ',' },
  { name: 'CSV_UPDATE',          value: '{{ barcode }}',     type: 'csv_update',    allowOOBExecution: true,  skipOutput: true,  label: null, csvFile: '', searchColumn: 1, columnToUpdate: 2, rowToUpdate: 'first', newValue: '', notFoundValue: '', delimiter: ',' },
  { name: 'GOOGLE_SHEETS',       value: '{{ barcode }}',     type: 'google_sheets', allowOOBExecution: true,  skipOutput: false, label: null, sheetId: '', workSheetIndex: 0, searchColumnA1: 'A', columnToUpdateA1: 'B', columnToReadA1: 'B', rowToUpdate: 'first', columnsToAppend: ['{{ barcode }}'], newValue: '', notFoundValue: '', action: 'get' },
  { name: 'BEEP',                value: 'beep',              type: 'beep',          beepsNumber: 1, beepSpeed: 'medium' },
  { name: 'ALERT',               value: '',                  type: 'alert',         alertTitle: 'Alert', alertDiscardScanButton: 'Discard scan', alertScanAgainButton: 'Scan again', alertOkButton: 'Ok', alertTimeout: null, alertDefaultAction: 'ok' },
  { name: 'WOOCOMMERCE',         value: 'createProduct',     type: 'woocommerce',   allowOOBExecution: true, fields: [], consumer_key: '', consumer_secret: '', url_woocommerce: '', skipOutput: true, label: null },
];

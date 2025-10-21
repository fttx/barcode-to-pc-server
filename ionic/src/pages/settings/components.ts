import { NutjsKey } from '../../models/nutjs-key.model';
import moment from 'moment';
import { OutputBlockModel } from '../../models/output-block.model';

// Collect data from the app
export const data_collection: OutputBlockModel[] = [
  { name: 'DATE_TIME',           icon: 'clock',           value: '',                  type: 'date_time',     skipOutput: false,  label: null,  format: 'YYYY-MM-DD',  locale: moment.locale(),  matchBarcodeDate: true },
  { name: 'TIMESTAMP',           icon: 'clock',           value: 'timestamp',         type: 'variable',      skipOutput: false,  label: null },
  { name: 'SCAN_SESSION_NAME',   icon: 'tag',             value: 'scan_session_name', type: 'variable',      skipOutput: false,  label: null },
  { name: 'DEVICE_NAME',         icon: 'device-mobile',   value: 'deviceName',        type: 'variable',      skipOutput: false,  label: null },
  { name: 'NUMBER',              icon: 'number',          value: 'number',            type: 'variable',      skipOutput: false,  label: null,  filter: null,          errorMessage: null,       defaultValue: '1' },
  { name: 'TEXT',                icon: 'italic',          value: 'text',              type: 'variable',      skipOutput: false,  label: null,  filter: null,          errorMessage: null,       defaultValue: null },
  { name: 'BARCODE',             icon: 'screen-full',     value: 'BARCODE',           type: 'barcode',       skipOutput: false,  label: null,  enabledFormats: [],    filter: null,            errorMessage: null },
  { name: 'IMAGE',               icon: 'image',           value: '',                  type: 'image',         outputImagePath: '', imageHd: false },
  { name: 'SELECT_OPTION',       icon: 'tasklist',        value: '',                  type: 'select_option', skipOutput: false,  label: null, title: '',              message: '' },
  { name: 'GEOLOCATION',         icon: 'location',        value: '',                  type: 'geolocation',   outputMode: 'coordinates', maxDistanceFromSavedLocation: 1, skipOutput: false, label: null },
  { name: 'STATIC_TEXT',         icon: 'three-bars',      value: '',                  type: 'text',          skipOutput: false,  label: null },
]

// Control the flow
export const flow_control: OutputBlockModel[] = [
  { name: 'IF',                  icon: 'code-square',     value: '',                  type: 'if' },
  { name: 'ENDIF',               icon: 'code-square',     value: 'endif',             type: 'endif' },
  { name: 'DELAY',               icon: 'stopwatch',       value: '',                  type: 'delay' },
]

// Keyboard emulation and other outputs
export const keyboard_actions: OutputBlockModel[] = [
  { name: 'PRESS KEY',           icon: 'diff-modified',   value: '',                  type: 'key',           keyId: NutjsKey.Space,     modifierKeys: [] },
  { name: 'ENTER',               icon: 'diff-modified',   value: '',                  type: 'key',           keyId: NutjsKey.Enter,     modifierKeys: [] },
  { name: 'TAB',                 icon: 'diff-modified',   value: '',                  type: 'key',           keyId: NutjsKey.Tab,       modifierKeys: [] },
]

// Functions executed remotely
export const functions: OutputBlockModel[] = [
  { name: 'JAVASCRIPT_FUNCTION', icon: 'file-code',       value: "(function(barcode) {\n\treturn barcode;\n})(barcode);",                  type: 'function',      allowOOBExecution: false, skipOutput: false, label: null },
  { name: 'HTTP_REQUEST',        icon: 'globe',           value: '',                  type: 'http',          allowOOBExecution: true,  skipOutput: false, label: null, httpMethod: 'get', httpData: null, httpParams: null, httpHeaders: null, httpOAuthMethod: 'disabled', httpOAuthConsumerKey: null, httpOAuthConsumerSecret: null, httpUseResultAsACK: false,  timeout: 10000, markAsACKValue: false },
  { name: 'RUN',                 icon: 'play',            value: '',                  type: 'run',           allowOOBExecution: true,  skipOutput: false, label: null, timeout: 10000 },
  { name: 'CSV_LOOKUP',          icon: 'file-moved',      value: '{{ barcode }}',     type: 'csv_lookup',    allowOOBExecution: true,  skipOutput: false, label: null, csvFile: '', searchColumn: 1, resultColumn: 2, notFoundValue: '', delimiter: ',' },
  { name: 'CSV_UPDATE',          icon: 'file-moved',      value: '{{ barcode }}',     type: 'csv_update',    allowOOBExecution: true,  skipOutput: true,  label: null, csvFile: '', searchColumn: 1, columnToUpdate: 2, rowToUpdate: 'first', newValue: '', notFoundValue: '', delimiter: ',' },
  { name: 'GOOGLE_SHEETS',       icon: 'table',           value: '',                  type: 'google_sheets', allowOOBExecution: true,  skipOutput: true,  label: null, googleSheetsUrl: '', googleSheetsAction: 'append', googleSheetsValues: [], httpUseResultAsACK: true },
  { name: 'BEEP',                icon: 'unmute',          value: 'beep',              type: 'beep',          beepsNumber: 1, beepSpeed: 'medium' },
  { name: 'ALERT',               icon: 'browser',         value: '',                  type: 'alert',         alertTitle: 'Alert', alertDiscardScanButton: 'Discard scan', alertScanAgainButton: 'Scan again', alertOkButton: 'Ok', alertTimeout: null, alertDefaultAction: 'ok' },
  { name: 'WOOCOMMERCE',         icon: 'webhook',         value: 'createProduct',     type: 'woocommerce',   allowOOBExecution: true, fields: [], consumer_key: '', consumer_secret: '', url_woocommerce: '', skipOutput: true, label: null },
];

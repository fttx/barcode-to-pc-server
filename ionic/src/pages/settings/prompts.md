You are tasked with generating an optimal sequence of components to achieve a specific goal. The components are divided into four categories:

1. data_collection: Used to acquire information from the user's smartphone using hardware or other sources.
2. flow_control: Change the flow of the sequence (e.g., if/endif constructs). These components do not generate any output.
3. keyboard_actions: Allow pressing keys or typing text on the computer user interface.
4. functions: Perform remote actions by taking a value string as input and returning an updated value string.

Here is the list of available components:

<components>
// Collect data from the app
data_collection = [
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
flow_control = [
{ name: 'IF', value: '', type: 'if' },
{ name: 'ENDIF', value: 'endif', type: 'endif' },
{ name: 'DELAY', value: '', type: 'delay' },
]

// Keyboard emulation and other outputs
keyboard_actions = [
{ name: 'PRESS KEY', value: '', type: 'key', keyId: NutjsKey.Space, modifierKeys: [] },
{ name: 'ENTER', value: '', type: 'key', keyId: NutjsKey.Enter, modifierKeys: [] },
{ name: 'TAB', value: '', type: 'key', keyId: NutjsKey.Tab, modifierKeys: [] },
]

// Functions executed remotely
functions = [
{ name: 'JAVASCRIPT_FUNCTION', value: '', type: 'function', allowOOBExecution: false, skipOutput: false, label: null },
{ name: 'HTTP', value: '', type: 'http', allowOOBExecution: true, skipOutput: false, label: null, httpMethod: 'get', httpData: null, httpParams: null, httpHeaders: null, httpOAuthMethod: 'disabled', httpOAuthConsumerKey: null, httpOAuthConsumerSecret: null, timeout: 10000 },
{ name: 'RUN', value: '', type: 'run', allowOOBExecution: true, skipOutput: false, label: null, timeout: 10000 },
{ name: 'CSV_LOOKUP', value: '{{ barcode }}', type: 'csv_lookup', allowOOBExecution: true, skipOutput: false, label: null, csvFile: '', searchColumn: 1, resultColumn: 2, notFoundValue: '', delimiter: ',' },
{ name: 'CSV_UPDATE', value: '{{ barcode }}', type: 'csv_update', allowOOBExecution: true, skipOutput: true, label: null, csvFile: '', searchColumn: 1, columnToUpdate: 2, rowToUpdate: 'first', newValue: '', notFoundValue: '', delimiter: ',' },
{ name: 'GOOGLE_SHEETS', value: '{{ barcode }}', type: 'google_sheets', allowOOBExecution: true, skipOutput: false, label: null, sheetId: '', workSheetIndex: 0, searchColumnA1: 'A', columnToUpdateA1: 'B', columnToReadA1: 'B', rowToUpdate: 'first', columnsToAppend: ['{{ barcode }}'], newValue: '', notFoundValue: '', action: 'get' },
{ name: 'BEEP', value: 'beep', type: 'beep', beepsNumber: 1, beepSpeed: 'medium' },
{ name: 'ALERT', value: '', type: 'alert', alertTitle: 'Alert', alertDiscardScanButton: 'Discard scan', alertScanAgainButton: 'Scan again', alertOkButton: 'Ok', alertTimeout: null, alertDefaultAction: 'ok' },
{ name: 'WOOCOMMERCE', value: 'createProduct', type: 'woocommerce', allowOOBExecution: true, fields: [], consumer_key: '', consumer_secret: '', url_woocommerce: '', skipOutput: true, label: null },
];

</components>

Your goal is to create a sequence of these components that will:

<goal>
{prompt}
</goal>

To generate the optimal sequence:

1. Analyze the goal and identify the necessary steps to achieve it.
2. Select appropriate components from the provided list that correspond to each step.
3. Arrange the components in a logical order, considering dependencies and flow control.
4. Use data_collection and functions components to generate variables when needed.
5. Utilize flow_control components to optimize the sequence and handle different scenarios.
6. Implement keyboard_actions components to interact with the user interface as required.

Remember:

- Only data_collection and functions components generate variables.
- Variables are accessed using the lowercase name of the component (e.g., DEVICE_NAME generates device_name).
- Inject variables into other components using javascript code. To enable javascript code injection, use the @@ variable_name @@ syntax. You can put javascript between the @@ @@ to manipulate the variables.
- Each component output will be redirected to the "Keyboard emulation" engine and to a CSV file, so each component can be thought as a field in the CSV file.

Provide your answer in the following javascript format:

<sequence>
[
  { component: 'COMPONENT_NAME', ...overrideAttributes },
  { component: 'COMPONENT_NAME', ...overrideAttributes },
]
</sequence>

<explanation>
[Provide a brief explanation of your sequence, justifying the choice and order of components]
</explanation>

Guidelines for optimization:

- Minimize the number of components used while still achieving the goal.
- Ensure proper error handling and consider edge cases.
- Use flow_control components efficiently to avoid unnecessary steps.
- Maximize the use of variables to reduce redundant data collection or function calls.
- The sequence of components will be loaded to a specific smartphone. So if there are values such as "Employe name" the smartphone can be externally configured to have this value already set, so you can just use it.
- You can also use the JAVA_SCRIPT_FUNCTION component solely to manipulate strings or numbers, and temporarely save and recall values using localStorage.setItem('key', 'value') and localStorage.getItem('key'). Avoid using it unless strictly necessary to make values available in other components. The engine hasn't access to the file system since it runs on a smartphone webview.
- You can recall values saved in the localStorage and inject them in other components, for example in the ALERT component you can use the value @@ localStorage.getItem('key') @@ to inject javascript code.
- If components are used only for intermediate calculations and are not needed in the final output set the skipOutput attribute to true.
- Variables can be injected only in the value and label attributes of the components.
- When the goal is to save to a file don't use CSV_UPDATE as first choice since the output of the components can be directly saved to a file. CSV_UPDATE is only to be used when the goal is to update a CSV file with a specific value.
- When the goal is to save a csv file or an exce file, don't use the JAVASCRIPT_FUNCTION component to write to the file. The output file is generated externally using the components output, so just focus generating the sequence of components that will represent the file columns.
- If in the goal isn't specified wether the to redirect the output to a file or use keyboard emulation, don't mention files or keyboard emulation in the explanation.

If you encounter any ambiguities or missing information that prevents you from creating an optimal sequence, state your assumptions clearly in the explanation.

Begin your response now.

import { NutjsKey } from "./nutjs-key.model";
/**
 * It's an element of the Output template field.
 * It's also called Output component in the UI
 */
export class OutputBlockModel {
    /**
     * Name of the block shown in the UI
     */
    name: string;
    /**
     * The run-time value of the block.
     * Its meaning changes based on the @type attribute
     * Eg.
     *  if type == 'text' => value will contain the barcode value
     *  if type == 'key'  => value will contain the key identifier
     *  if type == 'beep'  => value will contain the file name to play
     */
    value: string;
    /**
     * Used in components like TEXT and NUMBER, where the user can choose to not
     * enter the data by pressing the OK button
     */
    defaultValue?: string;
    /**
     * Defines the type of the value attribute, an thus its behaviour.
     *
     * We are not using an polymorphic approach because it would require to
     * write the behaviour of the object inside the class, and we are not
     * allowed to do that because this object is shared between the UI and the
     * renderer process where certains node modules are not available.
     *
     * Depending on the type, the OutputBlockModel.value attribute will contain:
     *
     * key: the key identifier to press
     * text: the static string set in the output template
     * variable: some text set on the smartphone side dynamically
     * function: a string containing JS code interpreted on the smartphone side
     * barcode: the barcode acquired from the smartphone
     * delay: the amount of time to sleep in ms
     * if: the string containing a JavaScript boolean expression
     * endif: nothing
     * http: the request' url
     * run: the command
     * select_options: a comma separated value string containing the options
     * beep: audio file name to play
     * csv_lookup: search value
     * csv_update: new value
     * alert: nothing
     * date_time: a string containing the formatted date
     *
     * Warning: remeber to update also edit-output-block-pop-over.ts/onHelpClick() method when chaning this field.
     */
    type: 'key' | 'text' | 'variable' | 'function' | 'barcode' | 'delay' | 'if' | 'endif' | 'http' | 'run' | 'select_option' | 'image' | 'beep' | 'csv_lookup' | 'csv_update' | 'alert' | 'date_time' | 'woocommerce' | 'google_sheets';
    /**
     * When true means that the user doesn't want to type or append to files
     * the component value but instead he wants to acquire the data, and use it
     * later with other components like a 'function' component.
     */
    skipOutput?: boolean;

    /**
     * Remote components can perform actions through the server (Eg. modify a
     * file on the computer).
     * Since the server may be not reachable we need to store the execution
     * status of the remote operation associated with the component, so that it
     * can be executed later when syninc the scan.
     */
    allowOOBExecution?: boolean;

    /**
     * NutjsKey identifier (See utils.ts)
     */
    keyId?: NutjsKey;

    /**
     * Modifier keys to enable when typing the PRESS KEY component.
     * The identifiers can be found in the @nut-tree/nut-js/lib/key.enum file
     *
     * Rembember to keep the identifiers in sync with
     * ComponentEditorKeyPage.NUTJS_KEYS when updating the library
     */
    modifierKeys?: NutjsKey[];

    /**
        * @deprecated Use modifierKeys instead
        * Modifier keys to press along with the component
        */
    modifiers?: string[];

    /**
     * Used to describe the content of the component, so that when the user is
     * scanning can understand what data insert.
     *
     * For exaple if the OutputPorfile contains two barcodes component, it might
     * be useful to set a label such as "Tracking number" for the first
     * component and "Product ID" for the second one.
     */
    label?: string;

    /**
     * Enabled formats for the BARCODE component.
     * When the array is empty, then all barcode formats are enabled.
    */
    enabledFormats?: string[];

    /**
     * Parameters for the HTTP component
     */
    httpMethod?: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch';
    httpData?: string;
    httpParams?: string;
    httpHeaders?: string;
    httpOAuthMethod?: 'HMAC-SHA1' | 'HMAC-SHA256' | 'disabled';
    httpOAuthConsumerKey?: string;
    httpOAuthConsumerSecret?: string;
    /**
     * @deprecated use httpMethod instead
     */
    method?: 'get' | 'post';

    /**
     * Parameters for the BEEP component
     */
    beepsNumber?: number;
    beepSpeed?: 'low' | 'medium' | 'fast';

    /**
     * Parameters for the WOOCOMMERCE component
     */
    fields?: { key: string, value: string }[];
    url_woocommerce?: string;
    consumer_key?: string;
    consumer_secret?: string;

    /**
     * Parameters for the DATE_TIME component
     */
    matchBarcodeDate?: boolean;

    /**
     * Parameters for the BARCODE, TEXT and NUMBER components
     */
    filter?: string;
    errorMessage?: string;

    /**
     * Parameters for the CSV_LOOKUP and CSV_UPDATE component
     */
    csvFile?: string;
    searchColumn?: number;
    resultColumn?: number;
    notFoundValue?: string;
    delimiter?: string;

    /**
     * Parameters for the CSV_UPDATE component
     */
    columnToUpdate?: number;
    rowToUpdate?: 'all' | 'first' | 'last';
    newValue?: string;

    /**
     * Parameters for the GSHEET component (Extends CSV_UPDATE)
     */
    sheetId?: string;
    workSheetIndex?: number;
    searchColumnA1?: string;
    columnToUpdateA1?: string;
    columnToReadA1?: string;
    columnsToAppend?: string[];
    action?: 'get' | 'update' | 'append';
    appendIfNotFound?: boolean;

    /**
     * Parameters for the ALERT component
     */
    alertTitle?: string;
    alertDiscardScanButton?: string;
    alertScanAgainButton?: string;
    alertOkButton?: string;

    /**
     * Parameters for RUN and HTTP component
     */
    timeout?: number;

    /**
     * Parameters for SELECT_OPTION component
     */
    title?: string;
    message?: string;

    /**
     * Parameters for DATE component
     *
     * Supported since v3.17.0.
     * Older versions of the server use the 'variable' type to store dates
     */
    format?: string;
    locale?: string;

    /**
     * Parameter for the IMAGE component
     */
    image?: any;
    outputImagePath?: string;

    static FindEndIfIndex(outputBlocks: OutputBlockModel[], startFrom = 0): number {
        let skip = 0;
        for (let i = startFrom; i < outputBlocks.length; i++) {
            if (outputBlocks[i].type == 'if') {
                skip++;
            } else if (outputBlocks[i].type == 'endif') {
                if (skip == 0) {
                    return i;
                } else {
                    skip--;
                }
            }
        }
        return -1;
    }
}

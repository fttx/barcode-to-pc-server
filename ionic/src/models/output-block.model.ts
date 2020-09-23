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
     * A block is editable if the user is allowed to edit the component
     * value through the UI
     */
    editable?: boolean;
    /**
     * Defines the behaviour of the OutputBlock.
     *
     * We are not using an polymorphic approach because it would require to
     * write the behaviour of the object inside the class, and we are not
     * allowed to do that because this object is shared between the UI and the
     * renderer process where certains node modules are not available.
     *
     * key is a key that can be pressed
     * text is a string that can be set beforehand
     * variable is some attribute of ScanModel that can be converted to string
     * function is a string containing JS code that can be interpreted
     * barcode is ScanModel.barcode
     * delay is like sleep or wait
     * http for http requests
     * select_options is used to store CSV values
     *
     * Warning: remeber to update also edit-output-block-pop-over.ts/onHelpClick() method when chaning this field.
     */
    type: 'key' | 'text' | 'variable' | 'function' | 'barcode' | 'delay' | 'if' | 'endif' | 'http' | 'run' | 'select_option' | 'beep' | 'csv_lookup' | 'alert';
    /**
     * When true means that the user doesn't want to type or append to files
     * the component value but instead he wants to acquire the data, and use it
     * later with other components like a 'function' component.
     */
    skipOutput?: boolean;

    /**
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
    /**
     * @deprecated
     */
    method?: 'get' | 'post'; // TODO: add upgrade script

    /**
     * Parameters for the BEEP component
     */
    beepsNumber?: number;
    beepSpeed?: 'low' | 'medium' | 'fast';

    /**
     * Parameters for the BARCODE, TEXT and NUMBER components
     */
    filter?: string;
    errorMessage?: string;

    /**
     * Parameters for the CSV_LOOKUP component
     */
    csvFile?: string;
    searchColumn?: number;
    resultColumn?: number;
    notFoundValue?: string;
    delimiter?: string;

    /**
     * Parameters for the ALERT component
     */
    alertTitle?: string;
    alertDiscardScanButton?: string;
    alertScanAgainButton?: string;
    alertOkButton?: string;

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

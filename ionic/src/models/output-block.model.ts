/**
 * It's an element of the Output field
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
     */
    value: string;
    /**
     * A block is editable if the user is allowed to edit the component 
     * value through the UI
     */
    editable?: boolean = false;
    /**
     * key is a key that can be pressed
     * text is a string that can be set beforehand
     * variable is some attribute of ScanModel that can be converted to string
     * function is a string containing JS code that can be interpreted
     * barcode is ScanModel.barcode
     * delay is like sleep or wait
     */
    type: 'key' | 'text' | 'variable' | 'function' | 'barcode' | 'delay';
}

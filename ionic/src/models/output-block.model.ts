/**
 * It's an element of the Output field.
 * Sometimes i also refer to it as Output component
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
    type: 'key' | 'text' | 'variable' | 'function' | 'barcode' | 'delay' | 'if' | 'endif';
    /**
     * When true means that the user doesn't want to type or append to files
     * the component value but instead he wants to acquire the data, and use it
     * later with other components like a 'function' component.
     */
    skipOutput?: boolean = false;


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

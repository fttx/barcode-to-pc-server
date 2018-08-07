export class StringComponentModel {
    name: string;
    value: string;
    editable?: boolean = false;
    type: 'key' | 'text' | 'variable' | 'function' | 'barcode' | 'delay'; 
    // key is a key that can be pressed
    // text is a string that can be typed
    // variable is something inside a ScanModel that can be typed
    // function is a string that can be evaluated
    // barcode is ScanModel.barcode
}

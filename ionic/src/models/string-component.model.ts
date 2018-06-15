export class StringComponentModel {
    name: string;
    value: string;
    editable?: boolean = false;
    type: 'key' | 'text' | 'variable' | 'function' | 'barcode' | 'delay';
}

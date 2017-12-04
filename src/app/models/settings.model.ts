import { StringComponentModel } from "./string-component.model";
import * as os from 'os';

export class SettingsModel {
    enableRealtimeStrokes: boolean = true;
    enableOpenInBrowser: boolean = false;
    typedString: StringComponentModel[] = [
        { name: 'BARCODE', value: 'barcode', type: 'barcode' },
        { name: 'ENTER', value: 'enter', type: 'key' }
    ];
    newLineCharacter: string = os.EOL.replace('\r', 'CR').replace('\n', 'LF');;
    enableQuotes: boolean = true;
}
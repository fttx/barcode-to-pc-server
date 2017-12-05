import { StringComponentModel } from "./string-component.model";
import * as os from 'os';

export class SettingsModel {
    enableRealtimeStrokes: boolean = true;
    enableOpenInBrowser: boolean = false;
    typedString: StringComponentModel[] = [
        { name: 'BARCODE', value: 'barcode', type: 'barcode' },
        { name: 'ENTER', value: 'enter', type: 'key' }
    ];
    newLineCharacter: string = os.release().toLowerCase().indexOf('windows') == -1 ? 'LF' : 'CRLF';
    enableQuotes: boolean = true;
}
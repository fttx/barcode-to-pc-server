import * as os from 'os';
import { StringComponentModel } from './string-component.model';

export class SettingsModel {
    enableRealtimeStrokes: boolean = true;
    enableOpenInBrowser: boolean = false;
    typedString: StringComponentModel[] = [
        { name: 'BARCODE', value: 'barcode', type: 'barcode' },
        { name: 'ENTER', value: 'enter', type: 'key' }
    ];
    newLineCharacter: string = os.release().toLowerCase().indexOf('windows') == -1 ? 'LF' : 'CRLF';
    enableQuotes: boolean = true;
    enableTray: boolean = true;
    appendCSVEnabled: boolean = false;
    csvPath: string;
    typeMethod: 'keyboard' | 'clipboard' = 'keyboard';
    enableAdvancedSettings: boolean = false; 
    autoUpdate: boolean = true;
}
import * as os from 'os';
import { OutputBlockModel } from './output-block.model';
import { OutputProfileModel } from './output-profile.model';

export class SettingsModel {
    enableRealtimeStrokes: boolean = true;
    enableOpenInBrowser: boolean = false;
    /**
     * @deprecated use outputProfiles instead
     */
    typedString: OutputBlockModel[] = [
        { name: 'BARCODE', value: 'barcode', type: 'barcode' },
        { name: 'ENTER', value: 'enter', type: 'key' }
    ];
    outputProfiles: OutputProfileModel[] = [
        {
            name: "Profile 1",
            outputBlocks: [{ name: 'BARCODE', value: 'barcode', type: 'barcode' }, { name: 'ENTER', value: 'enter', type: 'key' }]
        },
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
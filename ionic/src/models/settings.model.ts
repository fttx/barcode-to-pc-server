import * as os from 'os';
import { OutputBlockModel } from './output-block.model';
import { OutputProfileModel } from './output-profile.model';

/**
 * Server global settings, editable from the Settings page and also accessible
 * from the main process.
 *
 * WARNING: do not forget to initialize the fields! Otherwise they won't work
 * properly.
 */
export class SettingsModel {
    enableRealtimeStrokes: boolean = true;
    enableOpenInBrowser: boolean = false;
    /**
     * @deprecated use outputProfiles instead
     */
    typedString: OutputBlockModel[] = [
        { name: 'BARCODE', value: 'barcode', type: 'barcode', editable: true, skipOutput: false },
        { name: 'ENTER', value: 'enter', type: 'key' }
    ];
    outputProfiles: OutputProfileModel[] = [
        {
            name: "Profile 1",
            outputBlocks: [{ name: 'BARCODE', value: 'barcode', type: 'barcode', editable: true, skipOutput: false }, { name: 'ENTER', value: 'enter', type: 'key' }]
        },
    ];
    newLineCharacter: string = os.release().toLowerCase().indexOf('windows') == -1 ? 'LF' : 'CRLF';
    csvDelimiter: string = ",";
    exportOnlyText: boolean = true;
    enableQuotes: boolean = true;
    enableTray: boolean = true;
    appendCSVEnabled: boolean = false;
    csvPath: string = null;
    typeMethod: 'keyboard' | 'clipboard' = 'keyboard';
    enableAdvancedSettings: boolean = false;
    autoUpdate: boolean = true;
}
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
    constructor(private os: string) { }
    enableRealtimeStrokes: boolean = true;
    enableOpenInBrowser: boolean = false;
    /**
     * @deprecated use outputProfiles instead
     */
    typedString: OutputBlockModel[] = [
        { name: 'BARCODE', value: 'BARCODE', type: 'barcode', editable: true, skipOutput: false, label: null, enabledFormats: [] },
        { name: 'ENTER', value: 'enter', type: 'key', modifiers: [] }
    ];
    outputProfiles: OutputProfileModel[] = [
        {
            // Keep in sync with settings.ts, and barcode-to-pc-app/settings.ts/generateDefaultOutputProfiles()
            name: "Output template 1",
            version: null,
            outputBlocks: [
                { name: 'BARCODE', value: 'BARCODE', type: 'barcode', editable: true, skipOutput: false, label: null, enabledFormats: [], filter: null, errorMessage: null },
                { name: 'ENTER', value: 'enter', type: 'key', modifiers: [] }
            ]
        },
    ];
    newLineCharacter: string = (this.os.indexOf('windows') == -1) ? 'LF' : 'CRLF';
    csvDelimiter: string = ",";
    exportOnlyText: boolean = true;
    enableQuotes: boolean = false;
    enableTray: boolean = true;
    openAutomatically: ('yes' | 'no' | 'minimized') = 'yes';
    appendCSVEnabled: boolean = false;
    csvPath: string = null;
    typeMethod: 'keyboard' | 'clipboard' = 'keyboard';
    enableAdvancedSettings: boolean = false;
    autoUpdate: boolean = true;
    onSmartphoneChargeCommand: string = '';
    maxScanSessionsNumber: number = 2000; // Update also SettingsPage.MAX_SCAN_SESSION_NUMBER_UNLIMITED
}

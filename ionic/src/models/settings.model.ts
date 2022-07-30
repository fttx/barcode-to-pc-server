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
  // Rembember to keep the identifiers in sync when updating the nutjs library
  public static KEYS_MODIFERS = [
    { name: 'LeftAlt', id: 3, enabled: false, },
    { name: 'LeftControl', id: 4, enabled: false, },
    { name: 'RightAlt', id: 5, enabled: false, },
    { name: 'RightControl', id: 6, enabled: false, },
    { name: 'LeftShift', id: 7, enabled: false, },
    { name: 'LeftSuper', id: 8, enabled: false, },
    { name: 'RightShift', id: 9, enabled: false, },
    { name: 'RightSuper', id: 10, enabled: false, },
  ];

  // Rembember to keep the identifiers in sync when updating the nutjs library
  public static KEYS = [
    { name: 'Space', id: 0, },
    { name: 'Escape', id: 1, },
    { name: 'Tab', id: 2, },
    { name: 'F1', id: 11, },
    { name: 'F2', id: 12, },
    { name: 'F3', id: 13, },
    { name: 'F4', id: 14, },
    { name: 'F5', id: 15, },
    { name: 'F6', id: 16, },
    { name: 'F7', id: 17, },
    { name: 'F8', id: 18, },
    { name: 'F9', id: 19, },
    { name: 'F10', id: 20, },
    { name: 'F11', id: 21, },
    { name: 'F12', id: 22, },
    { name: 'F13', id: 23, },
    { name: 'F14', id: 24, },
    { name: 'F15', id: 25, },
    { name: 'F16', id: 26, },
    { name: 'F17', id: 27, },
    { name: 'F18', id: 28, },
    { name: 'F19', id: 29, },
    { name: 'F20', id: 30, },
    { name: 'F21', id: 31, },
    { name: 'F22', id: 32, },
    { name: 'F23', id: 33, },
    { name: 'F24', id: 34, },
    { name: 'Num0', id: 35, },
    { name: 'Num1', id: 36, },
    { name: 'Num2', id: 37, },
    { name: 'Num3', id: 38, },
    { name: 'Num4', id: 39, },
    { name: 'Num5', id: 40, },
    { name: 'Num6', id: 41, },
    { name: 'Num7', id: 42, },
    { name: 'Num8', id: 43, },
    { name: 'Num9', id: 44, },
    { name: 'A', id: 45, },
    { name: 'B', id: 46, },
    { name: 'C', id: 47, },
    { name: 'D', id: 48, },
    { name: 'E', id: 49, },
    { name: 'F', id: 50, },
    { name: 'G', id: 51, },
    { name: 'H', id: 52, },
    { name: 'I', id: 53, },
    { name: 'J', id: 54, },
    { name: 'K', id: 55, },
    { name: 'L', id: 56, },
    { name: 'M', id: 57, },
    { name: 'N', id: 58, },
    { name: 'O', id: 59, },
    { name: 'P', id: 60, },
    { name: 'Q', id: 61, },
    { name: 'R', id: 62, },
    { name: 'S', id: 63, },
    { name: 'T', id: 64, },
    { name: 'U', id: 65, },
    { name: 'V', id: 66, },
    { name: 'W', id: 67, },
    { name: 'X', id: 68, },
    { name: 'Y', id: 69, },
    { name: 'Z', id: 70, },
    { name: 'Grave', id: 71, },
    { name: 'Minus', id: 72, },
    { name: 'Equal', id: 73, },
    { name: 'Backspace', id: 74, },
    { name: 'LeftBracket', id: 75, },
    { name: 'RightBracket', id: 76, },
    { name: 'Backslash', id: 77, },
    { name: 'Semicolon', id: 78, },
    { name: 'Quote', id: 79, },
    { name: 'Return', id: 80, },
    { name: 'Comma', id: 81, },
    { name: 'Period', id: 82, },
    { name: 'Slash', id: 83, },
    { name: 'Left', id: 84, },
    { name: 'Up', id: 85, },
    { name: 'Right', id: 86, },
    { name: 'Down', id: 87, },
    { name: 'Print', id: 88, },
    { name: 'Pause', id: 89, },
    { name: 'Insert', id: 90, },
    { name: 'Delete', id: 91, },
    { name: 'Home', id: 92, },
    { name: 'End', id: 93, },
    { name: 'PageUp', id: 94, },
    { name: 'PageDown', id: 95, },
    { name: 'Add', id: 96, },
    { name: 'Subtract', id: 97, },
    { name: 'Multiply', id: 98, },
    { name: 'Divide', id: 99, },
    { name: 'Decimal', id: 100, },
    { name: 'Enter', id: 101, },
    { name: 'NumPad0', id: 102, },
    { name: 'NumPad1', id: 103, },
    { name: 'NumPad2', id: 104, },
    { name: 'NumPad3', id: 105, },
    { name: 'NumPad4', id: 106, },
    { name: 'NumPad5', id: 107, },
    { name: 'NumPad6', id: 108, },
    { name: 'NumPad7', id: 109, },
    { name: 'NumPad8', id: 110, },
    { name: 'NumPad9', id: 111, },
    { name: 'CapsLock', id: 112, },
    { name: 'ScrollLock', id: 113, },
    { name: 'NumLock', id: 114, },
    { name: 'AudioMute', id: 115, },
    { name: 'AudioVolDown', id: 116, },
    { name: 'AudioVolUp', id: 117, },
    { name: 'AudioPlay', id: 118, },
    { name: 'AudioStop', id: 119, },
    { name: 'AudioPause', id: 120, },
    { name: 'AudioPrev', id: 121, },
    { name: 'AudioNext', id: 122, },
    { name: 'AudioRewind', id: 123, },
    { name: 'AudioForward', id: 124, },
    { name: 'AudioRepeat', id: 125, },
    { name: 'AudioRandom', id: 126 },
  ];

  public static KEY_ID_ENTER = String(SettingsModel.KEYS.find(x => x.name.toLocaleLowerCase() == 'enter').id);
  public static KEY_ID_TAB = String(SettingsModel.KEYS.find(x => x.name.toLocaleLowerCase() == 'tab').id);

  constructor(private os: string) { }
  enableRealtimeStrokes: boolean = true;
  enableOpenInBrowser: boolean = false;
  /**
   * @deprecated use outputProfiles instead
   */
  typedString: OutputBlockModel[] = [
    { name: 'BARCODE', value: 'BARCODE', type: 'barcode', skipOutput: false, label: null, enabledFormats: [] },
    { name: 'ENTER', value: SettingsModel.KEY_ID_ENTER, type: 'key', modifierKeys: [] }
  ];
  outputProfiles: OutputProfileModel[] = [
    {
      // Keep in sync with settings.ts, and barcode-to-pc-app/settings.ts/generateDefaultOutputProfiles()
      name: "Output template 1",
      version: null,
      outputBlocks: [
        { name: 'BARCODE', value: 'BARCODE', type: 'barcode', skipOutput: false, label: null, enabledFormats: [], filter: null, errorMessage: null },
        { name: 'ENTER', value: SettingsModel.KEY_ID_ENTER, type: 'key', modifierKeys: [] }
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

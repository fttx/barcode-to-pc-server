import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { NutjsKey } from '../../../models/nutjs-key.model';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';

@Component({
  selector: 'page-component-editor-key',
  templateUrl: 'component-editor-key.html',
})
export class ComponentEditorKeyPage implements OnInit {
  public outputBlock: OutputBlockModel;

  // Rembember to keep the identifiers in sync when updating the nutjs library and utils, and nutjskey.model file
  public static KEYS_MODIFERS = [
    { name: 'LeftAlt', id: NutjsKey.LeftAlt, enabled: false, },
    { name: 'LeftControl', id: NutjsKey.LeftControl, enabled: false, },
    { name: 'RightAlt', id: NutjsKey.RightAlt, enabled: false, },
    { name: 'RightControl', id: NutjsKey.RightControl, enabled: false, },
    { name: 'LeftShift', id: NutjsKey.LeftShift, enabled: false, },
    { name: 'LeftSuper', id: NutjsKey.LeftSuper, enabled: false, },
    { name: 'RightShift', id: NutjsKey.RightShift, enabled: false, },
    { name: 'RightSuper', id: NutjsKey.RightSuper, enabled: false, },
    { name: 'LeftWin', id: NutjsKey.LeftWin, enabled: false, },
    { name: 'RightWin', id: NutjsKey.RightWin, enabled: false, },
    { name: 'LeftCmd', id: NutjsKey.LeftCmd, enabled: false, },
    { name: 'RightCmd', id: NutjsKey.RightCmd, enabled: false, },
  ];

  // Rembember to keep the identifiers in sync when updating the nutjs library and utils, and nutjskey.model file
  public static KEYS = [
    { name: 'Space', id: NutjsKey.Space, },
    { name: 'Escape', id: NutjsKey.Escape, },
    { name: 'Tab', id: NutjsKey.Tab, },
    { name: 'F1', id: NutjsKey.F1, },
    { name: 'F2', id: NutjsKey.F2, },
    { name: 'F3', id: NutjsKey.F3, },
    { name: 'F4', id: NutjsKey.F4, },
    { name: 'F5', id: NutjsKey.F5, },
    { name: 'F6', id: NutjsKey.F6, },
    { name: 'F7', id: NutjsKey.F7, },
    { name: 'F8', id: NutjsKey.F8, },
    { name: 'F9', id: NutjsKey.F9, },
    { name: 'F10', id: NutjsKey.F10, },
    { name: 'F11', id: NutjsKey.F11, },
    { name: 'F12', id: NutjsKey.F12, },
    { name: 'F13', id: NutjsKey.F13, },
    { name: 'F14', id: NutjsKey.F14, },
    { name: 'F15', id: NutjsKey.F15, },
    { name: 'F16', id: NutjsKey.F16, },
    { name: 'F17', id: NutjsKey.F17, },
    { name: 'F18', id: NutjsKey.F18, },
    { name: 'F19', id: NutjsKey.F19, },
    { name: 'F20', id: NutjsKey.F20, },
    { name: 'F21', id: NutjsKey.F21, },
    { name: 'F22', id: NutjsKey.F22, },
    { name: 'F23', id: NutjsKey.F23, },
    { name: 'F24', id: NutjsKey.F24, },
    { name: 'Num0', id: NutjsKey.Num0, },
    { name: 'Num1', id: NutjsKey.Num1, },
    { name: 'Num2', id: NutjsKey.Num2, },
    { name: 'Num3', id: NutjsKey.Num3, },
    { name: 'Num4', id: NutjsKey.Num4, },
    { name: 'Num5', id: NutjsKey.Num5, },
    { name: 'Num6', id: NutjsKey.Num6, },
    { name: 'Num7', id: NutjsKey.Num7, },
    { name: 'Num8', id: NutjsKey.Num8, },
    { name: 'Num9', id: NutjsKey.Num9, },
    { name: 'A', id: NutjsKey.A, },
    { name: 'B', id: NutjsKey.B, },
    { name: 'C', id: NutjsKey.C, },
    { name: 'D', id: NutjsKey.D, },
    { name: 'E', id: NutjsKey.E, },
    { name: 'F', id: NutjsKey.F, },
    { name: 'G', id: NutjsKey.G, },
    { name: 'H', id: NutjsKey.H, },
    { name: 'I', id: NutjsKey.I, },
    { name: 'J', id: NutjsKey.J, },
    { name: 'K', id: NutjsKey.K, },
    { name: 'L', id: NutjsKey.L, },
    { name: 'M', id: NutjsKey.M, },
    { name: 'N', id: NutjsKey.N, },
    { name: 'O', id: NutjsKey.O, },
    { name: 'P', id: NutjsKey.P, },
    { name: 'Q', id: NutjsKey.Q, },
    { name: 'R', id: NutjsKey.R, },
    { name: 'S', id: NutjsKey.S, },
    { name: 'T', id: NutjsKey.T, },
    { name: 'U', id: NutjsKey.U, },
    { name: 'V', id: NutjsKey.V, },
    { name: 'W', id: NutjsKey.W, },
    { name: 'X', id: NutjsKey.X, },
    { name: 'Y', id: NutjsKey.Y, },
    { name: 'Z', id: NutjsKey.Z, },
    { name: 'Grave', id: NutjsKey.Grave, },
    { name: 'Minus', id: NutjsKey.Minus, },
    { name: 'Equal', id: NutjsKey.Equal, },
    { name: 'Backspace', id: NutjsKey.Backspace, },
    { name: 'LeftBracket', id: NutjsKey.LeftBracket, },
    { name: 'RightBracket', id: NutjsKey.RightBracket, },
    { name: 'Backslash', id: NutjsKey.Backslash, },
    { name: 'Semicolon', id: NutjsKey.Semicolon, },
    { name: 'Quote', id: NutjsKey.Quote, },
    { name: 'Return', id: NutjsKey.Return, },
    { name: 'Comma', id: NutjsKey.Comma, },
    { name: 'Period', id: NutjsKey.Period, },
    { name: 'Slash', id: NutjsKey.Slash, },
    { name: 'Left', id: NutjsKey.Left, },
    { name: 'Up', id: NutjsKey.Up, },
    { name: 'Right', id: NutjsKey.Right, },
    { name: 'Down', id: NutjsKey.Down, },
    { name: 'Print', id: NutjsKey.Print, },
    { name: 'Pause', id: NutjsKey.Pause, },
    { name: 'Insert', id: NutjsKey.Insert, },
    { name: 'Delete', id: NutjsKey.Delete, },
    { name: 'Home', id: NutjsKey.Home, },
    { name: 'End', id: NutjsKey.End, },
    { name: 'PageUp', id: NutjsKey.PageUp, },
    { name: 'PageDown', id: NutjsKey.PageDown, },
    { name: 'Add', id: NutjsKey.Add, },
    { name: 'Subtract', id: NutjsKey.Subtract, },
    { name: 'Multiply', id: NutjsKey.Multiply, },
    { name: 'Divide', id: NutjsKey.Divide, },
    { name: 'Decimal', id: NutjsKey.Decimal, },
    { name: 'Enter', id: NutjsKey.Enter, },
    { name: 'NumPad0', id: NutjsKey.NumPad0, },
    { name: 'NumPad1', id: NutjsKey.NumPad1, },
    { name: 'NumPad2', id: NutjsKey.NumPad2, },
    { name: 'NumPad3', id: NutjsKey.NumPad3, },
    { name: 'NumPad4', id: NutjsKey.NumPad4, },
    { name: 'NumPad5', id: NutjsKey.NumPad5, },
    { name: 'NumPad6', id: NutjsKey.NumPad6, },
    { name: 'NumPad7', id: NutjsKey.NumPad7, },
    { name: 'NumPad8', id: NutjsKey.NumPad8, },
    { name: 'NumPad9', id: NutjsKey.NumPad9, },
    { name: 'CapsLock', id: NutjsKey.CapsLock, },
    { name: 'ScrollLock', id: NutjsKey.ScrollLock, },
    { name: 'NumLock', id: NutjsKey.NumLock, },
    { name: 'AudioMute', id: NutjsKey.AudioMute, },
    { name: 'AudioVolDown', id: NutjsKey.AudioVolDown, },
    { name: 'AudioVolUp', id: NutjsKey.AudioVolUp, },
    { name: 'AudioPlay', id: NutjsKey.AudioPlay, },
    { name: 'AudioStop', id: NutjsKey.AudioStop, },
    { name: 'AudioPause', id: NutjsKey.AudioPause, },
    { name: 'AudioPrev', id: NutjsKey.AudioPrev, },
    { name: 'AudioNext', id: NutjsKey.AudioNext, },
    { name: 'AudioRewind', id: NutjsKey.AudioRewind, },
    { name: 'AudioForward', id: NutjsKey.AudioForward, },
    { name: 'AudioRepeat', id: NutjsKey.AudioRepeat, },
    { name: 'AudioRandom', id: NutjsKey.AudioRandom },
    { name: 'Menu', id: NutjsKey.Menu },
    { name: 'Fn', id: NutjsKey.Fn },
  ];

  public keyId: string = ComponentEditorKeyPage.KEYS[0].id;

  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider, // required from template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    this.keyId = ComponentEditorKeyPage.KEYS.find(x => x.id == this.outputBlock.keyId).id;
    ComponentEditorKeyPage.KEYS_MODIFERS.forEach(key => {
      key.enabled = this.outputBlock.modifierKeys.findIndex(x => x === key.id) != -1;

      if (this.electronProvider.getPlatform() === "darwin") {
        key.name.replace("Super", "Command");
        key.name.replace("Alt", "Option");
      } else {
        key.name.replace("Super", "Win");
      }
    });

  }

  ngOnInit() {
  }

  onKeyToPressChange(event, key) {
    this.outputBlock.keyId = key;
  }

  onModifierChange(event, key) {
    this.outputBlock.modifierKeys = ComponentEditorKeyPage.KEYS_MODIFERS.filter(x => x.enabled).map(x => x.id);
  }

  getKeyNameById(outputBlock: OutputBlockModel) {
    const key = ComponentEditorKeyPage.KEYS.find(x => x.id == outputBlock.keyId);
    if (key) return key.name;
    return '';
  }

  getKeys() {
    return ComponentEditorKeyPage.KEYS;
  }

  getModifierKeys() {
    return ComponentEditorKeyPage.KEYS_MODIFERS;
  }
}

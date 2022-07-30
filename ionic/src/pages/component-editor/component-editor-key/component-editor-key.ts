import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Config } from '../../../config';
import { OutputBlockModel } from '../../../models/output-block.model';
import { SettingsModel } from '../../../models/settings.model';
import { ElectronProvider } from '../../../providers/electron/electron';

@Component({
  selector: 'page-component-editor-key',
  templateUrl: 'component-editor-key.html',
})
export class ComponentEditorKeyPage implements OnInit {
  public outputBlock: OutputBlockModel;

  public keyId: number = SettingsModel.KEYS[0].id;

  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider, // required from template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    this.keyId = SettingsModel.KEYS.find(x => String(x.id) == this.outputBlock.value).id;
    SettingsModel.KEYS_MODIFERS.forEach(key => {
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
    this.outputBlock.value = key + '';
  }

  onModifierChange(event, key) {
    console.log(event, key);
    this.outputBlock.modifierKeys = SettingsModel.KEYS_MODIFERS.filter(x => x.enabled).map(x => x.id);
  }

  getKeyNameById(outputBlock: OutputBlockModel) {
    const key = SettingsModel.KEYS.find(x => String(x.id) == outputBlock.value);
    if (key) return key.name;
    return '';
  }

  getKeys() {
    return SettingsModel.KEYS;
  }

  getModifierKeys() {
    return SettingsModel.KEYS_MODIFERS;
  }
}

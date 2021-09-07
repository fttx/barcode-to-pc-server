import { Component, Input, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Config } from '../../../../electron/src/config';
import { OutputBlockModel } from '../../models/output-block.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'component-editor',
  templateUrl: 'component-editor.html'
})
export class ComponentEditorComponent implements OnInit {
  @Input() outputBlock: OutputBlockModel;
  public color: string;

  constructor(
    public viewCtrl: ViewController,
    public electronProvider: ElectronProvider,
  ) {
  }

  ngOnInit(): void {
    this.color = UtilsProvider.GetComponentColor(this.outputBlock);
  }

  public onCloseClick() {
    this.viewCtrl.dismiss();
  }

  public onHelpClick() {
    this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_CREATE_OUTPUT_TEMPLATE);
  }
}

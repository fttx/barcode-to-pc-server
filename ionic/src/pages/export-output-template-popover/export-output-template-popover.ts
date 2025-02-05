import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { OutputBlockModel } from '../../models/output-block.model';
import { OutputProfileExportedModel } from '../../models/output-profile-exported.model';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { TelemetryService } from '../../providers/telemetry/telemetry';

/**
 * Generated class for the ExportOutputTemplatePopoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-export-output-template-popover',
  templateUrl: 'export-output-template-popover.html',
})
export class ExportOutputTemplatePopoverPage {

  public selectedOutputProfile: OutputProfileExportedModel = new OutputProfileExportedModel();
  public includeServerSettings = false;
  public deleteOtherTemplates = false;
  public replaceComponentsBasePath = false;
  public basePath = '';
  public settings: SettingsModel;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private electronProvider: ElectronProvider,
    private viewCtrl: ViewController,
    private telemetryService: TelemetryService
  ) {
    this.selectedOutputProfile = this.navParams.get('outputProfile');
    this.settings = JSON.parse(this.navParams.get('settings'));
    delete this.settings['os'];
    delete this.settings['outputProfiles'];
    this.selectedOutputProfile.version = this.electronProvider.appGetVersion();

    if (this.hasComponentsWithPaths()) {
      const paths = this.selectedOutputProfile.outputBlocks.map((outputBlock: OutputBlockModel) => {
        if (outputBlock.type == 'csv_lookup') return outputBlock.csvFile;
        if (outputBlock.type == 'csv_update') return outputBlock.csvFile;
        if (outputBlock.type == 'run') return outputBlock.value;
        if (outputBlock.type == 'image') return outputBlock.outputImagePath;
        return null;
      }).filter(x => x != null);

      // find the common starting path to all the paths by comparing the first path to all the others and removing the last character until they match
      let basePath = paths[0];
      for (let i = 1; i < paths.length; i++) {
        while (paths[i].startsWith(basePath) == false && basePath.length >= 0) {
          basePath = basePath.substring(0, basePath.length - 1);
        }
      }

      // If there isn't a common base path, then use the first path
      if (basePath == '') {
        basePath = paths[0];
        // Remove the file name
        basePath = paths[0].split('\\').slice(0, -1).join('\\');
        basePath = !basePath.length ? basePath.split('/').slice(0, -1).join('/') : basePath;
      }
      this.basePath = basePath;
    }
  }

  ionViewDidLoad() {
  }

  close() {
    this.viewCtrl.dismiss();
  }

  export() {
    if (this.basePath.endsWith('\\') || this.basePath.endsWith('/')) {
      this.basePath = this.basePath.substring(0, this.basePath.length - 1);
    }
    this.selectedOutputProfile.extras = {
      timestamp: new Date().getTime(),
      settings: this.includeServerSettings ? this.settings : null,
      deleteOtherTemplates: this.deleteOtherTemplates,
      basePath: this.replaceComponentsBasePath ? this.basePath : null,
    };
    this.viewCtrl.dismiss(this.selectedOutputProfile);
    this.telemetryService.sendEvent('settings_export_template', null, null);
  }

  hasComponentsWithPaths() {
    return this.selectedOutputProfile.outputBlocks.filter(x =>
      x.type == 'csv_lookup' || x.type == 'csv_update' ||
      x.type == 'run' || x.type == 'image'
    ).length != 0;
  }
}

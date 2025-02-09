import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Alert, AlertButton, AlertController, Events, Modal, ModalController, Navbar, NavController, NavParams, PopoverController } from 'ionic-angular';
import { DragulaService } from "ng2-dragula";
import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { interval } from 'rxjs/observable/interval';
import { tap, throttle } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { Config } from '../../config';
import { OutputBlockModel } from '../../models/output-block.model';
import { OutputProfileModel } from '../../models/output-profile.model';
import { SettingsModel } from '../../models/settings.model';
import { ElectronProvider } from '../../providers/electron/electron';
import { LicenseProvider } from '../../providers/license/license';
import { UtilsProvider } from '../../providers/utils/utils';
import { OutputProfileExportedModel } from '../../models/output-profile-exported.model';
import { ExportOutputTemplatePopoverPage } from '../export-output-template-popover/export-output-template-popover';
import { BtpAlertController } from '../../providers/btp-alert-controller/btp-alert-controller';
import { TelemetryService } from '../../providers/telemetry/telemetry';
import { data_collection, flow_control, keyboard_actions, functions } from './components';
import { AiPromptPopoverPage } from './ai-prompt-popover/ai-prompt-popover';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage implements OnInit, OnDestroy {
  @ViewChild(Navbar) navBar: Navbar;

  public unsavedSettingsAlert: Alert = null;
  public settings: SettingsModel = new SettingsModel(UtilsProvider.GetOS());
  public availableOutputBlocks: OutputBlockModel[] = SettingsPage.GetAvailableOutputBlocks();

  private lastSavedSettings: string;

  public selectedOutputProfile = 0;
  static MAX_SCAN_SESSION_NUMBER_UNLIMITED = 2000; // Update also SettingsModel.maxScanSessionsNumber
  private exportModal: Modal;
  private aiPromptModal: Modal;

  public static GetAvailableOutputBlocks(): OutputBlockModel[] {
    return [...keyboard_actions, ...data_collection, ...flow_control, ...functions] as OutputBlockModel[];
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dragulaService: DragulaService,
    private electronProvider: ElectronProvider,
    private licenseProvider: LicenseProvider,
    private alertCtrl: BtpAlertController,
    public events: Events,
    private ngZone: NgZone,
    private utils: UtilsProvider,
    public modalCtrl: ModalController,
    private telemetryService: TelemetryService,
  ) {
    this.dragulaService.destroy('dragula-group')
    this.dragulaService.createGroup('dragula-group', {
      copy: (el, source) => {
        return source.id === 'left';
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id !== 'left';
      },
      copyItem: (item: OutputBlockModel) => {
        return JSON.parse(JSON.stringify(item));
      },
      removeOnSpill: true
    });

    this.dragulaService.dropModel('dragula-group').subscribe(async ({ name, el, target, source, sibling, item, sourceModel, targetModel, }) => {
      if (item.value == 'number') {
        if (!(await this.licenseProvider.canUseNumberParameter(true))) {
          setTimeout(() => this.settings.outputProfiles[this.selectedOutputProfile].outputBlocks = this.settings.outputProfiles[this.selectedOutputProfile].outputBlocks.filter(x => x.value != 'number'), 1000)
        }
      }
    });
  }

  public getAppName() {
    return Config.APP_NAME;
  }

  public canAddMoreComponents() {
    return this.settings.outputProfiles[this.selectedOutputProfile].outputBlocks.length < this.licenseProvider.getNOMaxComponents();
  }

  public onSubscribeClick() {
    this.licenseProvider.showPricingPage('customOutputFieldOnSubscribeClick');
  }

  ionViewDidLoad() {
    this.settings = this.electronProvider.store.get(Config.STORAGE_SETTINGS, new SettingsModel(UtilsProvider.GetOS()));
    this.lastSavedSettings = JSON.stringify(this.settings);
    this.navBar.backButtonClick = (e: UIEvent) => {
      this.goBack();
    }
  }

  ionViewDidEnter() {

  }

  ionViewDidLeave() {
    if (this.exportModal != null) this.exportModal.dismiss();
    if (this.aiPromptModal != null) this.aiPromptModal.dismiss();
    this.events.publish('settings:goBack');
  }
  // willExit -> apply

  onApplyClick() {
    this.apply();
  }

  async onRestoreDefaultSettingsClick() {
    this.alertCtrl.create({
      title: await this.utils.text('restoreDefaultSettingsDialogTitle'),
      message: await this.utils.text('restoreDefaultSettingsDialogMessage'),
      buttons: [{
        text: await this.utils.text('restoreDefaultSettingsDialogCancelButton'), role: 'cancel'
      }, {
        text: await this.utils.text('restoreDefaultSettingsDialogRestoreButton'), handler: (opts) => {
          localStorage.setItem('woocommerce_parameters', null);
          this.settings = new SettingsModel(UtilsProvider.GetOS());
          this.apply();
        }
      }]
    }).present();
  }

  async apply() {
    return new Promise(async (resolve) => {
      let noIfs = this.settings.outputProfiles[this.selectedOutputProfile].outputBlocks.filter(x => x.type == 'if').length;
      let noEndIfs = this.settings.outputProfiles[this.selectedOutputProfile].outputBlocks.filter(x => x.type == 'endif').length;
      if (noIfs != noEndIfs) {
        let buttons: AlertButton[] = [{ text: await this.utils.text('applyDialogOKButton'), role: 'cancel', },];
        this.alertCtrl.create({
          title: await this.utils.text('syntaxErrorDialogTitle'),
          message: await this.utils.text('syntaxErrorDialogMessage'),
          buttons: buttons
        }).present();
        return resolve(false);
      }

      this.electronProvider.store.set(Config.STORAGE_SETTINGS, this.settings);
      if (ElectronProvider.isElectron()) {
        // Skip saving login items if the settings didn't change (to avoid macOS notification)
        if (JSON.parse(this.lastSavedSettings).openAutomatically != this.settings.openAutomatically) {
          this.electronProvider.appSetLoginItemSettings({
            openAtLogin: (this.settings.openAutomatically == 'yes' || this.settings.openAutomatically == 'minimized'),
            openAsHidden: this.settings.openAutomatically == 'minimized'
          });
        }
      }

      this.telemetryService.sendEvent('settings_save', null, null);
      this.telemetryService.sendEvent('max_templates_count', this.settings.outputProfiles.length, null);
      const maxComponents = this.settings.outputProfiles.reduce((max, profile) => Math.max(max, profile.outputBlocks.length), 0);
      this.telemetryService.sendEvent('max_components_count', maxComponents, null);
      this.telemetryService.sendEvent('keyboard_emulation', this.settings.enableRealtimeStrokes ? 1 : 0, null);
      this.telemetryService.sendEvent('csv_output', this.settings.appendCSVEnabled ? 1 : 0, null);
      this.telemetryService.sendEvent('excel_output', this.settings.outputToExcelEnabled ? 1 : 0, null);

      this.lastSavedSettings = JSON.stringify(this.settings);
      if (ElectronProvider.isElectron()) {
        this.electronProvider.ipcRenderer.send('settings');
      }
      resolve(true);
    });
  }

  async onEditOutputProfileNameClick() {
    let currentProfile = this.settings.outputProfiles[this.selectedOutputProfile];
    this.alertCtrl.create({
      title: await this.utils.text('outputTemplateNameDialogTitle'),
      // message: 'Inse',
      enableBackdropDismiss: false,
      inputs: [{ name: 'name', type: 'text', placeholder: currentProfile.name, value: currentProfile.name }],
      buttons: [{
        role: 'cancel',
        text: await this.utils.text('outputTemplateNameDialogCancelButton'),
        handler: () => { }
      }, {
        text: await this.utils.text('outputTemplateNameDialogOkButton'),
        handler: data => {
          if (data.name != "") {
            this.settings.outputProfiles[this.selectedOutputProfile].name = data.name;
          }
        }
      }]
    }).present();
  }

  async onDeleteOutputTemplateClick() {
    if (this.settings.outputProfiles.length <= 1) {
      return;
    }

    this.alertCtrl.create({
      title: await this.utils.text('deleteOutputTemplateDialogTitle'),
      message: await this.utils.text('deleteOutputTemplateDialogMessage'),
      buttons: [{
        text: await this.utils.text('deleteOutputTemplateDialogYesButton'),
        handler: () => {
          // change the selected OutputProfile
          let selectedIndex = this.selectedOutputProfile;
          this.selectedOutputProfile = selectedIndex == 0 ? selectedIndex : selectedIndex - 1;

          // remove the selected OutputProfile
          this.settings.outputProfiles = this.settings.outputProfiles.filter((x, index) => index != selectedIndex);
        }
      }, {
        text: await this.utils.text('deleteOutputTemplateDialogCancelButton'),
        role: 'cancel',
        handler: () => { }
      }]
    }).present();
  }

  async onExportOutputTemplateClick() {
    const outputProfile = await this.showOutputTemplateExportDialog();
    if (!outputProfile) return;
    const filePath = this.electronProvider.showSaveDialogSync({
      title: await this.utils.text('saveDialogTitle'),
      defaultPath: outputProfile.name + '.btpt',
      buttonLabel: await this.utils.text('saveDialogSaveButton'),
      filters: [{
        name: await this.utils.text('saveDialogFilterName', {
          "appName": Config.APP_NAME,
        }), extensions: ['btpt',]
      }],
    });
    if (!filePath) return;
    this.electronProvider.fsWriteFileSync(filePath, JSON.stringify(outputProfile), 'utf-8');
  }

  showOutputTemplateExportDialog(): Promise<OutputProfileExportedModel> {
    const selectedOutputProfile: OutputProfileExportedModel = this.settings.outputProfiles[this.selectedOutputProfile];
    return new Promise(async (resolve, reject) => {
      if (this.exportModal != null) this.exportModal.dismiss();
      this.exportModal = this.modalCtrl.create(ExportOutputTemplatePopoverPage, { outputProfile: selectedOutputProfile, settings: JSON.stringify(this.settings) }, { enableBackdropDismiss: false, showBackdrop: true });
      this.exportModal.onDidDismiss((exportedOutputProfile) => {
        resolve(exportedOutputProfile);
      });
      this.exportModal.present();
    });
  }

  async onImportOutputTemplateClick() {
    let filePaths = this.electronProvider.showOpenDialogSync({
      title: await this.utils.text('importDialogTitle'),
      buttonLabel: await this.utils.text('importDialogSelectButton'),
      defaultPath: this.electronProvider.appGetPath('desktop'),
      filters: [{
        name: await this.utils.text('saveDialogFilterName', {
          "appName": Config.APP_NAME,
        }), extensions: ['btpt']
      }],
      properties: ['openFile', 'createDirectory', 'promptToCreate',]
    });

    if (!filePaths || !filePaths[0]) return;

    // almost duplicate code on app.component.ts
    try {
      const data = this.electronProvider.fsReadFileSync(filePaths[0], { encoding: 'utf-8' });
      const templateObj = JSON.parse(data);
      const template = this.utils.upgradeTemplate(templateObj, templateObj.version);
      this.addOutputTemplate(template);
    } catch {
      const path = this.electronProvider.path;
      this.alertCtrl.create({
        title: await this.utils.text('openFileErrorDialogTitle'),
        message: await this.utils.text('openFileErrorDialogMessage', {
          "path": path.basename(filePaths[0]),
        }),
        buttons: [{ text: await this.utils.text('openFileErrorDialogOkButton'), role: 'cancel', }]
      }).present();
      return;
    }
  }

  async onNewOutputTemplateClick(useAi = false) {
    if (this.settings.outputProfiles.length >= this.licenseProvider.getNOMaxTemplates()) {
      await this.alertCtrl.create({
        title: await this.utils.text('outputTemplateLimitReachedDialogTitle'),
        message: await this.utils.text('outputTemplateLimitReachedDialogMessage'),
        buttons: [
          { text: await this.utils.text('upgradeDialogDismissButton'), role: 'cancel' },
          { text: await this.utils.text('upgradeDialogUpgradeButton'), handler: () => this.licenseProvider.showPricingPage('customOutputFieldOnSubscribeClick') }
        ]
      }).present();
      return;
    }

    let newTemplateName = null;
    if (useAi) {
      return new Promise(async (resolve) => {
        if (this.aiPromptModal != null) this.aiPromptModal.dismiss();
        this.aiPromptModal = this.modalCtrl.create(AiPromptPopoverPage, {}, {
          cssClass: 'btp-big-modal',
          enableBackdropDismiss: false,
          showBackdrop: true
        });

        this.aiPromptModal.onDidDismiss((result) => {
          if (result && result.template) {
            console.log(result);
            let outputTemplate: OutputProfileModel = {
              name: result.name,
              version: null,
              outputBlocks: result.template,
            };
            this.addOutputTemplate(outputTemplate)
          }
        });
        this.aiPromptModal.present();
      });
    }

    newTemplateName = await this.utils.text('newOutputTemplateName', {
      "number": (this.settings.outputProfiles.length + 1)
    });

    if (!newTemplateName) return;
    this.alertCtrl.create({
      title: await this.utils.text('newOutputTemplateDialogTitle'),
      message: await this.utils.text('newOutputTemplateDialogMessage'),
      enableBackdropDismiss: false,
      inputs: [{ name: 'name', type: 'text', placeholder: newTemplateName }],
      buttons: [{
        role: 'cancel', text: await this.utils.text('newOutputTemplateDialogCancelButton'),
        handler: () => { }
      }, {
        text: await this.utils.text('newOutputTemplateDialogOkButton'),
        handler: data => {
          if (data.name != "") {
            newTemplateName = data.name;
          }
          let outputTemplate: OutputProfileModel = {
            name: newTemplateName,
            version: null,
            outputBlocks: new SettingsModel(UtilsProvider.GetOS()).outputProfiles[0].outputBlocks
          };
          this.addOutputTemplate(outputTemplate)
        }
      }]
    }).present();
  }

  addOutputTemplate(outputTemplate) {
    // push isn't working, so we're using the spread operator (duplicated issue on the app.compoennt.ts file)
    this.settings.outputProfiles = [...this.settings.outputProfiles, outputTemplate];
    this.selectedOutputProfile = this.settings.outputProfiles.length - 1;
  }

  public settingsChanged = false;
  private checkSettingsChanged() {
    this.settingsChanged = this.lastSavedSettings != JSON.stringify(this.settings);
    return this.settingsChanged;
  }

  async goBack() {
    if (!this.checkSettingsChanged()) { // settings up to date
      this.navCtrl.pop();
    } else { // usnaved settings
      if (this.unsavedSettingsAlert !== null) {
        this.unsavedSettingsAlert.dismiss();
        this.unsavedSettingsAlert = null;
        return;
      }
      this.unsavedSettingsAlert = this.alertCtrl.create({
        enableBackdropDismiss: false,
        title: await this.utils.text('unsavedSettingsDialogTitle'),
        message: await this.utils.text('unsavedSettingsDialogMessage'),
        buttons: [
          {
            text: await this.utils.text('unsavedSettingsDialogCancelButton'),
            handler: () => { },
            role: 'cancel'
          }, {
            text: await this.utils.text('unsavedSettingsDialogDiscardButton'),
            handler: () => {
              this.navCtrl.pop();
            }
          },
          {
            text: await this.utils.text('unsavedSettingsDialogSaveButton'),
            handler: async () => {
              await this.apply();
              this.navCtrl.pop();
            }
          }]
      });
      this.unsavedSettingsAlert.present();
    }
  }

  async onSelectCSVPathClick() {
    let defaultPath = this.settings.csvPath;
    if (!defaultPath) {
      defaultPath = this.electronProvider.appGetPath('desktop')
    }

    let filePaths = this.electronProvider.showOpenDialogSync({
      title: await this.utils.text('selectCSVPathDialog'),
      buttonLabel: await this.utils.text('selectCSVSelectButton'),
      defaultPath: defaultPath,
      filters: [
        { name: await this.utils.text('selectCSVFilterText'), extensions: ['txt', 'csv', 'log'] },
        { name: await this.utils.text('selectCSVFilterAll'), extensions: ['*'] }
      ],
      properties: ['openFile', 'createDirectory', 'promptToCreate',]
    });

    if (filePaths && filePaths.length) {
      this.settings.csvPath = filePaths[0];
    }
  }

  async onSelectExcelPathClick() {
    let defaultPath = this.settings.csvPath;
    if (!defaultPath) {
      defaultPath = this.electronProvider.appGetPath('desktop')
    }

    let filePaths = this.electronProvider.showOpenDialogSync({
      title: await this.utils.text('selectExcelPathDialog'),
      buttonLabel: await this.utils.text('selectCSVSelectButton'),
      defaultPath: defaultPath,
      filters: [
        { name: await this.utils.text('selectExcelFilterText'), extensions: ['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv'] },
        { name: await this.utils.text('selectCSVFilterAll'), extensions: ['*'] }
      ],
      properties: ['openFile', 'createDirectory', 'promptToCreate',]
    });

    if (filePaths && filePaths.length) {
      this.settings.xlsxPath = filePaths[0];
    }
  }

  // Handle changes dection through 'mouseup' and 'keyup' DOM events
  // This way it's more efficient compared to the angular way.
  private domEvents: Subscription;
  ngOnInit(): void {
    let events = Observable.merge(fromEvent(window, 'mouseup'), fromEvent(window, 'keyup'));
    this.domEvents = events.pipe(
      throttle(ev => interval(1000), { leading: true, trailing: true }),
      tap(event => this.checkSettingsChanged()),
      tap(event => this.domEvent(event)),
    ).subscribe();
  }
  ngOnDestroy(): void {
    this.domEvents.unsubscribe();
  }

  // ESC button => Go back
  domEvent(event) {
    if (event.keyCode && event.keyCode == 27) {
      event.stopPropagation();
      event.preventDefault();
      if (this.unsavedSettingsAlert !== null) {
        this.unsavedSettingsAlert.dismiss();
        this.unsavedSettingsAlert = null;
        return;
      }
      this.goBack();
    }
  }

  async onCSVClick() {
    if (this.settings.appendCSVEnabled) {
      if (!(await this.licenseProvider.canUseCSVAppend(true))) {
        setTimeout(() => this.settings.appendCSVEnabled = false, 1000)
      }
    }
  }

  async onExcelClick() {
    if (this.settings.outputToExcelEnabled) {
      if (!(await this.licenseProvider.canUseCSVAppend(true))) {
        setTimeout(() => this.settings.outputToExcelEnabled = false, 1000)
      }
    }
  }

  onOpenAutomaticallyChange() {
    if (this.settings.openAutomatically == 'minimized' && this.electronProvider.processPlatform === 'darwin') {
      this.settings.enableTray = true;
    }
  }

  getMaxScanSessionNumberReadable() {
    if (this.settings.maxScanSessionsNumber == SettingsPage.MAX_SCAN_SESSION_NUMBER_UNLIMITED) return "Unlimited";
    return this.settings.maxScanSessionsNumber;
  }
  getMaxScanSessionNumber() { return SettingsPage.MAX_SCAN_SESSION_NUMBER_UNLIMITED };
  onMaxScanSessionNumberChange(e) {
    this.checkSettingsChanged();
  }

  onOutputToExcelModeChange() {
    if (this.settings.outputToExcelMode == 'update') {
      this.settings.mapExcelHeadersToComponents = true;
    }
  }
}

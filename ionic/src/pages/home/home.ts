import { Component, HostListener, NgZone, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import ElectronStore from 'electron-store';
import { saveAs } from 'file-saver';
import { Alert, AlertController, AlertOptions, Content, Events, ModalController, NavController, NavParams, Popover, PopoverController, Searchbar, ViewController } from 'ionic-angular';
import * as Papa from 'papaparse';
import { Config } from '../../../../electron/src/config';
import { DeviceModel } from '../../models/device.model';
import { requestModel, requestModelClearScanSessions, requestModelDeleteScan, requestModelDeleteScanSessions, requestModelHelo, requestModelPutScanSessions, requestModelUpdateScanSession } from '../../models/request.model';
import { ScanSessionModel } from '../../models/scan-session.model';
import { ScanModel } from '../../models/scan.model';
import { SettingsModel } from '../../models/settings.model';
import { DevicesProvider } from '../../providers/devices/devices';
import { ElectronProvider } from '../../providers/electron/electron';
import { LastToastProvider } from '../../providers/last-toast/last-toast';
import { LicenseProvider } from '../../providers/license/license';
import { UtilsProvider } from '../../providers/utils/utils';
import { ActivatePage } from '../activate/activate';
import { InfoPage } from '../info/info';
import { SettingsPage } from '../settings/settings';
import { gt, SemVer, lt } from 'semver';

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  public animateLast: boolean = false;
  public scanSessions: ScanSessionModel[] = [];
  public selectedScanSession: ScanSessionModel = null;
  public connectedDevices: DeviceModel[] = [];
  public hideSearchBar = true;
  public searchTerms = ''

  @ViewChild('scanSessionsContainer') scanSessionsContainer: Content;
  @ViewChild('searchbar') searchbar: Searchbar;

  private connectedClientPopover: Popover = null;
  private store: ElectronStore;
  private saveDebounceTimeout = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public popoverCtrl: PopoverController,
    private lastToast: LastToastProvider,
    public events: Events,
    public title: Title,
    public devicesProvider: DevicesProvider,
    private alertCtrl: AlertController,
    public licenseProvider: LicenseProvider,
  ) {
    // debug
    // this.scanSessions.push({id: 1,name: 'Scan session 1',date: new Date(),scannings: [  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),],selected: false,    }, {  id: 2,  name: 'Scan session 2',  date: new Date(),  scannings: [    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),  ],  selected: false,}, {  id: 3,  name: 'Scan session 3',  date: new Date(),  scannings: [    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),  ],  selected: false,}, {  id: 4,  name: 'Scan session 4',  date: new Date(),  scannings: [    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),  ],  selected: false,})
    this.store = new this.electronProvider.ElectronStore();

    this.events.subscribe('delete:scanSession', (scanSession) => {
      var index = this.scanSessions.indexOf(scanSession, 0);
      if (index > -1) {
        if (this.selectedScanSession && scanSession.id == this.selectedScanSession.id) {
          this.selectedScanSession = null;
        }
        this.scanSessions.splice(index, 1);
        this.save();
      }
    })

    this.devicesProvider.onConnectedDevicesListChange().subscribe((devices: DeviceModel[]) => {
      this.connectedDevices = devices;
      if (this.connectedClientPopover) {
        this.connectedClientPopover.dismiss();
      }
      // console.log('@@@', this.connectedDevices)
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // console.log(event)
    // if (event.keyCode == 70 && event.ctrlKey == true) { // ctrl+f, doesn't work on macos + karabiner

    // }

    if (event.keyCode == 27) {
      this.onSearchCancel(null);
    }
  }

  save() {
    // console.log('save()', this.scanSessions);
    if (this.saveDebounceTimeout != null) clearTimeout(this.saveDebounceTimeout);

    this.saveDebounceTimeout = setTimeout(() => {
      // console.log('save()');
      this.store.set(Config.STORAGE_SCAN_SESSIONS, this.scanSessions);
    }, 500)
  }

  onScanSessionClick(scanSession) {
    this.selectedScanSession = scanSession;
  }

  onSearch(event) {
    this.selectedScanSession = null;
  }

  onSearchCancel(event) {
    this.hideSearchBar = true;
    this.selectedScanSession = null;
    this.searchTerms = '';
  }

  filteredScanSessions() {
    let searchTerms = this.searchTerms.toLowerCase();
    return this.scanSessions.filter(scanSession =>
      scanSession.name.toLowerCase().indexOf(searchTerms) > -1
      ||
      scanSession.scannings.findIndex(scan => scan.displayValue.toLowerCase().indexOf(searchTerms) > -1) > -1
    )
  }

  ionViewDidLoad() {
    this.title.setTitle(Config.APP_NAME);
    this.scanSessions = this.store.get(Config.STORAGE_SCAN_SESSIONS, []);

    // If the app isn't package inside electron it will never
    // receive these events, so i won't subscribe to them
    if (!this.electronProvider.isElectron()) {
      return;
    }

    this.checkAccessibilityPermission();

    // Those events are inside ionViewDidLoad because they need to be listening
    // as long as the Home page is alive. Doesn't matter if there is another
    // page on top of it. They get registered only one time whene the Home page
    // loads, so there isn't the need to clear them or perform other checks.
    this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
      this.ngZone.run(() => this.lastToast.present('A connection was successfully established with ' + request.deviceName));

      // older versions of the app didn't send the version number
      if (!request.version) {
        this.showVersionMismatch();
        return;
      }

      // let appVersion = new SemVer(request.version);
      // if (lt(appVersion, 'x.x.x')) {
      // this.showVersionMismatch();
      // }
    });

    this.electronProvider.ipcRenderer.on(requestModel.ACTION_PUT_SCAN_SESSIONS, (e, request: requestModelPutScanSessions) => {
      this.ngZone.run(() => {
        let initialNoScans = this.scanSessions.map(scanSession => scanSession.scannings.length).reduce((a, b) => a + b, 0);
        request.scanSessions.forEach(newScanSession => {
          let scanSessionIndex = this.scanSessions.findIndex(x => x.id == newScanSession.id); // this is O(n^2) but i don't care since we don't have > 500 scan sessions, and the scanSessions array gets traversed all the way to the end only for the new created scan sessions
          if (scanSessionIndex != -1) {
            console.log('@ Scan session already present, merging the scannings')
            let existingScanSession = this.scanSessions[scanSessionIndex];

            if (existingScanSession.scannings.length == 0) {
              console.log('@ scannings array emtpy -> assigning the whole array')
              existingScanSession.scannings = newScanSession.scannings;
            } else if (existingScanSession.scannings.length != 0 && newScanSession.scannings.length == 1) {
              console.log('@ scannings array not emtpy -> adding only the new scans (the new scansession contains only one scan -> unshift)')
              let newScan = newScanSession.scannings[0];
              let alreadyExistingScanIndex = existingScanSession.scannings.findIndex(x => x.id == newScan.id); // performance can improved by reversing the scannings array, but the findIndex will return a complementar index

              if (alreadyExistingScanIndex == -1) {
                // I don't know why unshift doesn't work, so i'll use concat even though it is less performant
                // existingScanSession.scannings.unshift(newScan)
                existingScanSession.scannings = newScanSession.scannings.concat(existingScanSession.scannings);
              }
            } else {
              console.log('@ scannings array not emtpy -> adding only the new scans')

              // I expect to receive the scans sorted by id desc, so i copy
              // to the local scan list only the scans that have an id
              // greater than the one that has the lastest received scan.
              let lastReceivedScanId = existingScanSession.scannings[0].id;
              let alreadyExistingScanIndex = newScanSession.scannings.findIndex(newScan => newScan.id <= lastReceivedScanId); // performance can improved by reversing the scannings array, but the findIndex will return a complementar index

              console.log('@ lastReceivedScanId = ' + lastReceivedScanId + ' alreadyExistingScanIndex = ' + alreadyExistingScanIndex)

              if (alreadyExistingScanIndex != -1) { // if some scan is already present => i do not include them
                console.log('@ the list of the received scans includes scans that are already present, slicing the array from 0 to ' + alreadyExistingScanIndex)

                let newScans: ScanModel[] = newScanSession.scannings.slice(0, alreadyExistingScanIndex);
                existingScanSession.scannings = newScans.concat(existingScanSession.scannings)
              } else { // if the scans are all new, i copy all of them
                console.log('@ merging the scans as they are: ', newScanSession.scannings, existingScanSession.scannings)

                existingScanSession.scannings = newScanSession.scannings.concat(existingScanSession.scannings)
                // what if newScanSession.scannings is empty?
              }
            }
          } else {
            this.scanSessions.unshift(newScanSession);
            this.selectedScanSession = this.scanSessions[0];
            if (this.scanSessionsContainer) {
              this.scanSessionsContainer.scrollToTop();
            }
          }
          this.animateLast = true; setTimeout(() => this.animateLast = false, 1200);
          this.selectedScanSession = this.scanSessions[scanSessionIndex == -1 ? 0 : scanSessionIndex];
        })

        let finalNoScans = this.scanSessions.map(scanSession => scanSession.scannings.length).reduce((a, b) => a + b, 0);
        this.licenseProvider.limitMonthlyScans(finalNoScans - initialNoScans);

        this.save();
      }); // ngZone

      // if (request.scan.repeated) {
      //   let scanIndex = this.scanSessions[scanSessionIndex].scannings.findIndex(x => x.id == request.scan.id);
      //   if (scanIndex == -1) {
      //     this.scanSessions[scanSessionIndex].scannings.unshift(request.scan);
      //   }
      // }
    })

    this.electronProvider.ipcRenderer.on(requestModel.ACTION_DELETE_SCAN, (e, request: requestModelDeleteScan) => {
      this.ngZone.run(() => {

        let scanSessionIndex = this.scanSessions.findIndex(x => x.id == request.scanSessionId);
        if (scanSessionIndex != -1) {
          let scanIndex = this.scanSessions[scanSessionIndex].scannings.findIndex(x => x.id == request.scan.id);
          this.scanSessions[scanSessionIndex].scannings.splice(scanIndex, 1);
        }
        this.save();
      });
    });

    this.electronProvider.ipcRenderer.on(requestModel.ACTION_DELETE_SCAN_SESSION, (e, request: requestModelDeleteScanSessions) => {
      this.ngZone.run(() => {
        if (this.selectedScanSession && request.scanSessionIds.findIndex(x => x == this.selectedScanSession.id) != -1) {
          this.selectedScanSession = null;
        }
        this.scanSessions = this.scanSessions.filter(x => request.scanSessionIds.indexOf(x.id) < 0);
        this.save();
      });
    });

    this.electronProvider.ipcRenderer.on(requestModel.ACTION_UPDATE_SCAN_SESSION, (e, request: requestModelUpdateScanSession) => {
      this.ngZone.run(() => {
        let scanSessionIndex = this.scanSessions.findIndex(x => x.id == request.scanSessionId);
        if (scanSessionIndex != -1) {
          this.scanSessions[scanSessionIndex].name = request.scanSessionName;
          this.scanSessions[scanSessionIndex].date = request.scanSessionDate;
          this.save();
        }
      });
    });

    this.electronProvider.ipcRenderer.on(requestModel.ACTION_CLEAR_SCAN_SESSIONS, (e, request: requestModelClearScanSessions) => {
      this.ngZone.run(() => {
        let scanSessionIndex = this.scanSessions = [];
        this.save();
      });
    });

    this.electronProvider.ipcRenderer.on('find', (e, data: {}) => {
      this.ngZone.run(() => {
        this.hideSearchBar = false;
        setTimeout(() => {
          this.searchbar.setFocus();
        }, 250)
      })
    });
  }

  private accessibilityAlert: Alert;
  checkAccessibilityPermission() {
    if (this.accessibilityAlert) {
      this.accessibilityAlert.dismiss();
    }

    if (!this.electronProvider.isTrustedAccessibilityClient(false)) {
      this.accessibilityAlert = this.alertCtrl.create({
        title: 'Allow access', message:
          `In order to enable the "keyboard emulation" feature, ` + Config.APP_NAME + ` needs your permission to control the computer.
          <br/><br/>When you'll click Next, the System Preferences will open.
          <br/><br/>Please make you sure that ` + Config.APP_NAME + ` <u>is present</u> in the allowed list and that it <u>is checked</u>`,
        buttons: [{
          text: 'Next', handler: (opts: AlertOptions) => {
            this.electronProvider.isTrustedAccessibilityClient(true);
            setTimeout(() => this.checkAccessibilityPermission(), 1000 * 60)
          }
        }]
      });
      this.accessibilityAlert.present();
    }
  }

  onSettingsClick() {
    this.navCtrl.push(SettingsPage)
  }

  onMainMenuPopoverClick() {
    event.stopPropagation()
    let popover = this.popoverCtrl.create(MainMenuPopover);
    popover.present({
      ev: event
    });
  }

  onScanSessionContextMenuClick(event, scanSession) {
    event.stopPropagation()
    let popover = this.popoverCtrl.create(ScanSessionContextMenuPopover, { 'scanSession': scanSession });
    popover.present({
      ev: event
    });
  }

  getTitle() {
    if (this.selectedScanSession) {
      return this.selectedScanSession.name;
    }
    return Config.APP_NAME;
  }

  private randomScan() {
    let s = new ScanModel();
    s.format = "QR_CODE";
    s.text = (Math.random() * 100000000 + 1000) + '';
    s.date = new Date().getTime();
    s.id = s.date * Math.random();
    return s;
  }

  canAnimate() {
    return this.animateLast;
  }

  getItemBackgroundColor(scanSession) {
    return scanSession == this.selectedScanSession ? 'selected' : 'default';
  }


  onClearAllClick() {
    this.alertCtrl.create({
      title: 'Delete all scan sessions?', message: 'The scans session will be deleted from the server. You can send them again from your smartphone.', buttons: [{ text: 'Cancel', role: 'cancel' }, {
        text: 'Delete all', handler: (opts: AlertOptions) => {
          this.scanSessions = [];
          this.selectedScanSession = null;
          this.save();
        }
      }]
    }).present();
  }

  connectedClientsClick(event) {
    event.stopPropagation()

    if (this.connectedClientPopover) {
      this.connectedClientPopover.dismiss();
      return;
    }

    if (this.connectedDevices.length == 0) {
      return;
    }

    this.connectedClientPopover = this.popoverCtrl.create(ConnectedClientsPopover, { 'connectedDevices': this.connectedDevices });
    this.connectedClientPopover.onDidDismiss((data, role) => {
      this.connectedClientPopover = null;
    });
    this.connectedClientPopover.present({
      ev: event,
      animate: false,
    });
  }

  public getLocaleDate(date) {
    return new Date(date).toLocaleString();
  }

  private isVersionMismatchDialogVisible = false;
  private showVersionMismatch() {
    if (!this.isVersionMismatchDialogVisible) {
      let dialog = this.alertCtrl.create({
        title: 'Server/app version mismatch',
        message: 'Please update both app and server, otherwise they may not work properly.<br><br>Server can be downloaded at ' + Config.WEBSITE_NAME,
        buttons: [{ text: 'Cancel', role: 'cancel' }, {
          text: 'Download', handler: () => {
            this.electronProvider.shell.openExternal(Config.URL_DOWNLOAD_SERVER)
          }
        }]
      });
      dialog.didLeave.subscribe(() => {
        this.isVersionMismatchDialogVisible = false;
      })
      this.isVersionMismatchDialogVisible = true;
      dialog.present();
    }
  }

  public getScannings() {
    if (this.selectedScanSession == null) {
      return [];
    }
    return this.selectedScanSession.scannings;
  }

  public virtualTrackById(index, scan: ScanModel) {
    return scan.id;
  }
}

// ConnectedClientsPopover
@Component({
  template: `
    <ion-list>
      <ion-list-header>
        Connected devices
      </ion-list-header>
      <ion-item no-padding *ngFor="let connectedDevice of connectedDevices; let i = index;" [class.kicked]="connectedDevice.kicked">
        <ion-avatar item-start text-center padding-vertical>
          <ion-icon name="phone-portrait"></ion-icon>
        </ion-avatar>
        <h2>{{ connectedDevice.name }}</h2>
        <!-- p>{{ connectedDevice.name }}</p -->
      </ion-item>
    </ion-list>`,
  styles: [`.kicked { color: lightgrey !important;}`],
})
export class ConnectedClientsPopover {
  public connectedDevices: DeviceModel[] = [];
  constructor(
    public navParams: NavParams,
  ) {
    this.connectedDevices = this.navParams.get('connectedDevices');
  }
}


// ScanSessionContextMenuPopover
@Component({
  template: `
    <ion-list>
      <ion-list-header>Options</ion-list-header>
      <button ion-item (click)="exportAsCSV()">Export as CSV</button>
      <button ion-item (click)="delete()">Delete</button>
    </ion-list>
  `
})
export class ScanSessionContextMenuPopover {
  private scanSession: ScanSessionModel;
  private store: ElectronStore;

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public events: Events,
    private alertCtrl: AlertController,
  ) {
    this.store = new this.electronProvider.ElectronStore();
    this.scanSession = this.navParams.get('scanSession');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  exportAsCSV(index) {
    this.close()
    let settings: SettingsModel = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel());
    let newLineCharacter = settings.newLineCharacter.replace('CR', '\r').replace('LF', '\n');
    let rows = ScanModel.ToCSV(
      JSON.parse(JSON.stringify(this.scanSession.scannings)).reverse(),
      settings.exportOnlyText,
      settings.enableQuotes,
      settings.csvDelimiter,
      newLineCharacter
    );
    let file = new Blob([rows], { type: 'text/csv;charset=utf-8' });
    saveAs(file, this.scanSession.name + ".csv");
  }

  delete() {
    this.close();
    this.events.publish('delete:scanSession', this.scanSession)
  }
}



// MainMenuPopover
@Component({
  template: `
    <ion-list>
      <ion-list-header>More</ion-list-header>
      <button ion-item (click)="onShowPairQrCodeClick()" class="show-pair-qr-code-button">Pair the app with QR code</button>
      <button ion-item (click)="onActivateClick()">Activate</button>
      <button ion-item (click)="onInfoClick()">Info</button>
    </ion-list>
  `
})
export class MainMenuPopover {
  constructor(
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
  ) { }

  close() {
    this.viewCtrl.dismiss();
  }

  onShowPairQrCodeClick() {
    this.close();
    this.modalCtrl.create(QrCodePairingModal).present();
  }

  onInfoClick() {
    this.close()
    this.modalCtrl.create(InfoPage).present();
  }

  onActivateClick() {
    this.close();
    this.modalCtrl.create(ActivatePage).present();
  }
}

@Component({
  templateUrl: 'pop-over-qrcode.html'
})
export class QrCodePairingModal {
  public qrCodeUrl = '';


  constructor(
    public viewCtrl: ViewController,
    private utilsService: UtilsProvider,
  ) {
    utilsService.getQrCodeUrl().then((url: string) => this.qrCodeUrl = url);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
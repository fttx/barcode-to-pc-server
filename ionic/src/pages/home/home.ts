import { Component, HostListener, NgZone, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import {
  Content,
  Events,
  ModalController,
  NavController,
  NavParams,
  Popover,
  PopoverController,
  Searchbar,
  ViewController,
} from 'ionic-angular';
import * as Papa from 'papaparse';

import { Config } from '../../../../electron/src/config';
import { DeviceModel } from '../../models/device.model';
import {
  requestModel,
  requestModelClearScanSessions,
  requestModelDeleteScan,
  requestModelDeleteScanSessions,
  requestModelHelo,
  requestModelPutScanSessions,
  requestModelUpdateScanSession,
} from '../../models/request.model';
import { ScanSessionModel } from '../../models/scan-session.model';
import { ScanModel } from '../../models/scan.model';
import { DevicesProvider } from '../../providers/devices/devices';
import { ElectronProvider } from '../../providers/electron/electron';
import { LastToastProvider } from '../../providers/last-toast/last-toast';
import { StorageProvider } from '../../providers/storage/storage';
import { UtilsProvider } from '../../providers/utils/utils';
import { InfoPage } from '../info/info';
import { SettingsPage } from '../settings/settings';

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

  private lastInsertedScanIndex = 0;
  private connectedClientPopover: Popover = null;

  onScanSessionClick(scanSession) {
    this.selectedScanSession = scanSession;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public storageProvider: StorageProvider,
    public popoverCtrl: PopoverController,
    private lastToast: LastToastProvider,
    public events: Events,
    public title: Title,
    public devicesProvider: DevicesProvider,
  ) {
    // debug
    // this.scanSessions.push({id: 1,name: 'Scan session 1',date: new Date(),scannings: [  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),  this.randomScan(),],selected: false,    }, {  id: 2,  name: 'Scan session 2',  date: new Date(),  scannings: [    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),  ],  selected: false,}, {  id: 3,  name: 'Scan session 3',  date: new Date(),  scannings: [    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),  ],  selected: false,}, {  id: 4,  name: 'Scan session 4',  date: new Date(),  scannings: [    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),    this.randomScan(),  ],  selected: false,})

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

    this.devicesProvider.onConnectedDevicesListChange.subscribe((devices: DeviceModel[]) => {
      this.connectedDevices = devices;
      if (this.connectedClientPopover) {
        this.connectedClientPopover.dismiss();
      }
      // console.log('@@@', this.connectedDevices)
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

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // console.log(event)
    // if (event.keyCode == 70 && event.ctrlKey == true) { // ctrl+f, doesn't work on macos + karabiner

    // }

    if (event.keyCode == 27) {
      this.onSearchCancel(null);
    }
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
      scanSession.scannings.findIndex(scan => scan.text.toLowerCase().indexOf(searchTerms) > -1) > -1
    )
  }

  ionViewDidLoad() {
    this.title.setTitle(Config.APP_NAME);

    if (this.electronProvider.isElectron()) {

      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        this.ngZone.run(() => {

        });
        this.lastToast.present('A connection was successfully established with ' + request.deviceName)
      });

      this.electronProvider.ipcRenderer.on(requestModel.ACTION_PUT_SCAN_SESSIONS, (e, request: requestModelPutScanSessions) => {
        this.ngZone.run(() => {
          request.scanSessions.forEach(newScanSession => {
            let scanSessionIndex = this.scanSessions.findIndex(x => x.id == newScanSession.id); // this is O(n^2) but i don't care since we don't have > 500 scan sessions, and the scanSessions array gets traversed all the way to the end only for the new created scan sessions
            if (scanSessionIndex != -1) {
              console.log('@ Scan session already present, merging the scannings')
              let existingScanSession = this.scanSessions[scanSessionIndex];

              if (existingScanSession.scannings.length == 0) {
                console.log('@ scannings array emtpy -> assigning the whole array')
                existingScanSession.scannings = newScanSession.scannings;
              } else if (existingScanSession.scannings.length != 0 && newScanSession.scannings.length == 1) {
                console.log('@ scannings array not emtpy -> adding only the new scans (the new scansessions contain only one scan -> unshift)')
                let newScan = newScanSession.scannings[0];
                let alreadyExistingScanIndex = existingScanSession.scannings.findIndex(x => x.id == newScan.id); // performance can improved by reversing the scannings array, but the findIndex will return a complementar index

                if (alreadyExistingScanIndex == -1) {
                  existingScanSession.scannings.unshift(newScan)
                  this.lastInsertedScanIndex = 0;
                } else {
                  this.lastInsertedScanIndex = alreadyExistingScanIndex;
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
              this.addScanSession(newScanSession);
            }
            // this.scanSessionsContainer.scrollToTop();
            this.animateLast = true; setTimeout(() => this.animateLast = false, 1200);
            this.selectedScanSession = this.scanSessions[scanSessionIndex == -1 ? 0 : scanSessionIndex];
          })
          this.save();
        });

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
    }
    this.scanSessions = this.storageProvider.getScanSessions();
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

  canAnimate(i: number) {
    return this.animateLast && i == this.lastInsertedScanIndex;
  }

  save() {
    console.log('save()', this.scanSessions);
    this.storageProvider.setScanSessions(this.scanSessions);
  }

  getItemBackgroundColor(scanSession) {
    return scanSession == this.selectedScanSession ? 'selected' : 'default';
  }


  onClearAllClick() {
    this.scanSessions = [];
    this.selectedScanSession = null;
    this.save();
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

  private addScanSession(scanSessions: ScanSessionModel) {
    this.scanSessions.unshift(scanSessions);
    this.selectedScanSession = this.scanSessions[0];
    this.scanSessionsContainer.scrollToTop();
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

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public storageProvider: StorageProvider,
    public events: Events,
  ) {
    this.scanSession = this.navParams.get('scanSession');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  exportAsCSV(index) {
    this.close()

    let content = [];
    let settings = this.storageProvider.getSettings();
    content.push(Papa.unparse(this.scanSession.scannings.map(x => { return { 'text': x.text } }), {
      quotes: settings.enableQuotes,
      delimiter: ",",
      newline: settings.newLineCharacter.replace('CR', '\r').replace('LF', '\n')
    }));
    let file = new Blob(content, { type: 'text/csv;charset=utf-8' });
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
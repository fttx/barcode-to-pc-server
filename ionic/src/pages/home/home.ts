import { Component, NgZone, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import {
  Content,
  Events,
  ModalController,
  NavController,
  NavParams,
  PopoverController,
  ToastController,
  ViewController,
} from 'ionic-angular';
import * as Papa from 'papaparse';

import {
  requestModel,
  requestModelClearScanSessions,
  requestModelDeleteScan,
  requestModelDeleteScanSessions,
  requestModelHelo,
  requestModelPutScan,
  requestModelPutScanSession,
  requestModelPutScanSessions,
  requestModelUpdateScanSession,
} from '../../models/request.model';
import { ScanSessionModel } from '../../models/scan-session.model';
import { ScanModel } from '../../models/scan.model';
import { ElectronProvider } from '../../providers/electron/electron';
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
  @ViewChild('scanSessionsContainer') scanSessionsContainer: Content;

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
    private toastCtrl: ToastController,
    public events: Events,
    public title: Title,
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
  }

  ionViewDidLoad() {
    this.title.setTitle('Barcode To PC');

    if (this.electronProvider.isElectron()) {

      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        this.ngZone.run(() => {
          if (this.storageProvider.getLastScanDate(request.deviceId) != request.lastScanDate) {
            //console.log('helo->lastScanDateMismatch detected')
            this.electronProvider.ipcRenderer.send('lastScanDateMismatch', request.deviceId);
          }
        });


        this.toastCtrl.create({
          message: 'A connection was successfully established with ' + request.deviceName,
          duration: 6000
        }).present();
      });

      this.electronProvider.ipcRenderer.on(requestModel.ACTION_PUT_SCAN_SESSIONS, (e, request: requestModelPutScanSessions) => {
        this.ngZone.run(() => {
          request.scanSessions.forEach(scanSession => {
            let scanSessionIndex = this.scanSessions.findIndex(x => x.id == scanSession.id);
            if (scanSessionIndex != -1) {
              this.scanSessions[scanSessionIndex].scannings = scanSession.scannings;
            } else {
              this.scanSessions.push(scanSession);
              this.selectedScanSession = this.scanSessions[0];
              this.scanSessionsContainer.scrollToTop();
            }
          })
          //console.log('putScanSessions->settingNewLastScanDate')                    
          this.storageProvider.setLastScanDate(request.deviceId, request.lastScanDate);
          this.save();
        });
      })

      this.electronProvider.ipcRenderer.on(requestModel.ACTION_PUT_SCAN_SESSION, (e, request: requestModelPutScanSession) => {
        this.ngZone.run(() => {
          this.scanSessions.unshift(request.scanSessions);
          this.selectedScanSession = this.scanSessions[0];
          this.scanSessionsContainer.scrollToTop();
          this.save();
        });
      })

      this.electronProvider.ipcRenderer.on(requestModel.ACTION_PUT_SCAN, (e, request: requestModelPutScan) => {
        this.ngZone.run(() => {

          let scanSessionIndex = this.scanSessions.findIndex(x => x.id == request.scanSessionId);
          if (scanSessionIndex != -1) { // scan alreadyexists
            if (request.scan.repeated) {
              let scanIndex = this.scanSessions[scanSessionIndex].scannings.findIndex(x => x.id == request.scan.id);
              if (scanIndex == -1) {
                this.scanSessions[scanSessionIndex].scannings.unshift(request.scan);
              }
            } else {
              // this.scanSessionsContainer.scrollToTop();
              this.animateLast = true; setTimeout(() => this.animateLast = false, 1200);

              this.selectedScanSession = this.scanSessions[scanSessionIndex];
              this.scanSessions[scanSessionIndex].scannings.unshift(request.scan);
            }
          } else {
            // TODO: request a scansessions sync
            //console.log('Scan session already exists')
          }

          if (this.storageProvider.getLastScanDate(request.deviceId) != request.lastScanDate) {
            //console.log('putScan->lastScanDateMismatch detected')
            this.electronProvider.ipcRenderer.send('lastScanDateMismatch', request.deviceId);
          } else {
            //console.log('putScan->settingNewLastScanDate')
            this.storageProvider.setLastScanDate(request.deviceId, request.newScanDate);
          }
          this.save();
        });
      });

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
    return 'Barcode to PC'
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
    return this.animateLast && i == 0;
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
    this.save();
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
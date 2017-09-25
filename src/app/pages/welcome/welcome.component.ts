import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '../../services/storage.service';
import { ModalDirective } from 'ng2-bootstrap';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('helpModal') public helpModal: ModalDirective;
  @ViewChild("qrCode") qrCode;

  public addresses = [];
  public hostname = '';
  public defaultAddress;

  constructor(
    private storage: Storage,
    private router: Router,
    private electronService: ElectronService,
  ) {
    if (this.electronService.isElectron()) {
      this.electronService.ipcRenderer.on('clientConnected', (e, clientAddress) => {
        this.storage.everConnected = true;
        this.router.navigate(['/scan-session']);
      });

      this.electronService.ipcRenderer.on('addresses', (e, addresses) => {
        this.addresses = addresses;
      });

      this.electronService.ipcRenderer.on('defaultAddress', (e, defaultAddress) => {
        this.defaultAddress = defaultAddress;
      });

      this.electronService.ipcRenderer.on('hostname', (e, hostname) => {
        this.hostname = hostname;
      });
    }
  }

  ngOnInit() { }

  getQrCode() {
    const index = this.addresses.indexOf(this.defaultAddress);

    if (index > -1) { // removes the defaultAddress from the addresses list
      this.addresses.splice(index, 1);
    }

    if (this.defaultAddress) { // Adds the defaultAddress at very beginning of the list
      this.addresses.unshift(this.defaultAddress);
    }

    return 'http://app.barcodetopc.com/?h=' + encodeURIComponent(this.hostname) + '&a=' + encodeURIComponent(this.addresses.join('-'));
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IpcProxy } from '../../services/ipc-proxy.service'
import { Electron } from '../../services/electron.service'
import { Storage } from '../../services/storage.service';
import { ModalDirective } from 'ng2-bootstrap';

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
    private ipcProxy: IpcProxy,
    public electron: Electron,
    private storage: Storage,
    private router: Router,
  ) { }

  ngOnInit() {
    this.ipcProxy.onClientConnect().subscribe(() => {
      this.storage.everConnected = true;
      this.router.navigate(['']);
    });

    this.ipcProxy.onGetAddresses().subscribe(addresses => {
      this.addresses = addresses;
    });

    this.ipcProxy.onGetDefaultAddress().subscribe(address => {
      this.defaultAddress = address;
    });

    this.ipcProxy.onGetHostname().subscribe(hostname => {
      this.hostname = hostname;
    });
  }

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

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '../../services/storage.service';
import { ModalDirective } from 'ng2-bootstrap';
import { UtilsService } from '../../services/utils.service';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('helpModal') public helpModal: ModalDirective;
  @ViewChild("qrCode") qrCode;

  public qrCodeUrl = '';

  constructor(
    private storage: Storage,
    private router: Router,
    private utilsService: UtilsService,
    private electronService: ElectronService,
  ) {
    if (this.electronService.isElectron()) {
      this.electronService.ipcRenderer.on('clientConnected', (e, clientAddress) => {
        this.storage.everConnected = true;
        this.router.navigate(['/scan-session']);
      });
    }

    this.utilsService.getQrCodeUrl().then((url: string) => this.qrCodeUrl = url);
  }
  ngOnInit() { }

}

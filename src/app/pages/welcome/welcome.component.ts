import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IpcProxy } from '../../services/ipc-proxy.service'
import { Electron } from '../../services/electron.service'
import { Storage } from '../../services/storage.service';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('helpModal') public helpModal: ModalDirective;

  public showHint = false;

  constructor(
    private ipcProxy: IpcProxy,
    private electron: Electron,
    private storage: Storage,
    private router: Router,
  ) { }

  ngOnInit() {
    this.ipcProxy.onClientConnect().subscribe(() => {
      this.storage.setEverConnected(true);
      this.router.navigate(['']);
    });

    setTimeout(() => {
      this.showHint = true;
    }, 60000);
  }
}

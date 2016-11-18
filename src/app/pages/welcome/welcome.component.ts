import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IpcProxy } from '../../services/ipc-proxy.service'
import { Storage } from '../../services/storage.service';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(
    private ipcProxy: IpcProxy,
    private storage: Storage,
    private router: Router,
  ) { }

  ngOnInit() {
    this.ipcProxy.onClientConnect().subscribe(() => {
      this.storage.setEverConnected(true);
      this.router.navigate(['']);
    });
  }

  openUrl(url) {
    this.ipcProxy.openUrl(url);
  }
}

import { Component } from '@angular/core';

declare var window: any;
const electron = window.require ('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor() {/*
    if (typeof window['require'] !== "undefined") {
      let electron = window['require']("electron");
*/      let ipcRenderer = electron.ipcRenderer;

      ipcRenderer.send('connect');

      ipcRenderer.on('message', (event, arg) => {
        console.log('message received', arg)
      })
    }
  //}
}

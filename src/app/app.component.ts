import { Component } from '@angular/core';

declare var window: any;
//const electron = window.require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {
    /* let ipcRenderer = electron.ipcRenderer;
     console.log("catcat")
     ipcRenderer.send('connect');
 
     ipcRenderer.on('message', (event, arg) => {
       console.log('message received', arg)
     })*/
  }
}

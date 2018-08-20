import { Component } from '@angular/core';

/**
 * Generated class for the StatusBarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'status-bar',
  templateUrl: 'status-bar.html'
})
export class StatusBarComponent {

  text: string;

  constructor() {
    console.log('Hello StatusBarComponent Component');
    this.text = 'Hello World';
  }

}

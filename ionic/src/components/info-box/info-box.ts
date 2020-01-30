import { Component, Input } from '@angular/core';

/**
 * Generated class for the InfoBoxComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'info-box',
  templateUrl: 'info-box.html'
})
export class InfoBoxComponent {
  @Input('title') title: string;

  constructor() {
    this.title= '';
  }

}

import { Component, Input } from '@angular/core';
import { ElectronProvider } from '../../providers/electron/electron';

/**
 * Generated class for the NotificationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'notification',
  templateUrl: 'notification.html'
})
export class NotificationComponent {
  @Input('title') title: string;
  @Input('hideAfter') hideAfter: number;
  @Input('cta') cta: string;

  public hidden = false;

  constructor(
    private electronProvider: ElectronProvider,
  ) {
    console.log('Hello NotificationComponent Component');
    this.title = 'Hello World';
  }

  ngOnInit() {
    if (this.hideAfter) {
      setTimeout(() => {
        this.hidden = true;
      }, this.hideAfter)
    }
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  onCtaClick() {
    this.electronProvider.shell.openExternal(this.cta);
  }
}

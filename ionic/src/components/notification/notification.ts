import { Component, Input } from '@angular/core';
import { ElectronProvider } from '../../providers/electron/electron';

/**
 * Generates a box in the bottom-right side of the screen.
 * Once the notification is dismissed, or the CTA button is clicked, the notification won't be shown again
 * Required Input parameters: id
 */
@Component({
  selector: 'notification',
  templateUrl: 'notification.html'
})
export class NotificationComponent {
  @Input('title') title: string;
  @Input('hideAfter') hideAfter: number;
  @Input('cta') cta: string;
  @Input('ctaText') ctaText: string;
  @Input('id') id: string;

  public hidden = true;


  constructor(
    private electronProvider: ElectronProvider,
  ) {
  }

  ngOnInit() {
    if (this.hideAfter) {
      setTimeout(() => {
        this.hidden = true;
      }, this.hideAfter)
    }

    let alreadyViewed = this.electronProvider.store.get(this.getStoreShownKey(), false);
    if (!alreadyViewed) {
      this.show();
    }
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
    this.electronProvider.store.set(this.getStoreShownKey(), true);
  }

  onCtaClick() {
    this.electronProvider.shell.openExternal(this.cta);
    this.hide();
  }

  private getStoreShownKey() {
    return 'notification_' + this.id + '_viewed';
  }
}

import { Injectable } from '@angular/core';
import { Alert, AlertController, AlertOptions, App, Config, Events, NavOptions } from 'ionic-angular';

/*
  Generated class for the BtpAlertControllerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BtpAlertController extends AlertController {
  constructor(private app: App, config: Config, private events: Events) {
    super(app, config);
  }
  create(options: AlertOptions): BTPAlert {
    options.enableBackdropDismiss = options.enableBackdropDismiss !== undefined ? options.enableBackdropDismiss : false;
    options.cssClass = options.cssClass ? `btpv2-alert ${options.cssClass}` : 'btpv2-alert';
    options.mode = options.mode ? options.mode : 'md';
    if (options.buttons) {
      options.buttons.forEach(button => {
        if (typeof button === 'object') {
          button.cssClass = button.cssClass ? `btpv2-btn ${button.cssClass}` : 'btpv2-btn';
          if (button.role === 'text-cancel') { button.cssClass = button.cssClass ? `${button.cssClass} btpv2-btn-text-cancel` : 'btpv2-btn-text-cancel'; }
          else if (button.role === 'cancel') button.cssClass = button.cssClass ? `${button.cssClass} btpv2-btn-cancel` : 'btpv2-btn-cancel';
          else button.cssClass = button.cssClass ? `${button.cssClass} btpv2-btn-primary` : 'btpv2-btn-primary';
        }
      });
    }
    const alert = new BTPAlert(this.app, options, this.config, this.events);
    alert.onWillDismiss(() => { this.events.publish('btp-alert:dismiss', alert.id); });
    return alert;
  }
}

export class BTPAlert extends Alert {
  constructor(app: App, opts: AlertOptions, config: Config, private events: Events) {
    super(app, opts, config);
  }
  present(navOptions?: NavOptions): Promise<any> {
    navOptions = {
      ...{
        animate: true,
        duration: 600,
        easing: 'ease-in-out',
      },
      ...navOptions
    };
    const result = super.present(navOptions);
    this.events.publish('btp-alert:present', navOptions.id);
    return result;
  }
}

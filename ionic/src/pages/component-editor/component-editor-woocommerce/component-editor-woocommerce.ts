import { Component } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';
import { WooCommerceParameters } from '../../../models/woocommerce-parameters.model';
import { ElectronProvider } from '../../../providers/electron/electron';
@Component({
  selector: 'page-component-editor-woocommerce',
  templateUrl: 'component-editor-woocommerce.html',
})
export class ComponentEditorWooCommercePage {
  public outputBlock: OutputBlockModel;
  public rememberParameters = false;

  constructor(
    public navParams: NavParams,
    private electronProvider: ElectronProvider, // required from the template
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
  }

  addField() {
    // Push doesn't work => use assignment
    // this.outputBlock.fields.push({ key: '', value: '' });
    this.outputBlock.fields = [...this.outputBlock.fields, { key: '', value: '' }];
  }

  deleteField(removeIndex: number) {
    this.outputBlock.fields = this.outputBlock.fields.filter((x, index) => index != removeIndex);
  }

  ionViewWillEnter() {
    const parameters: WooCommerceParameters = JSON.parse(localStorage.getItem('woocommerce_parameters'));
    if (parameters) {
      if (!this.outputBlock.url_woocommerce.length && parameters.url && parameters.url.length) this.outputBlock.url_woocommerce = parameters.url;
      if (!this.outputBlock.consumer_key.length && parameters.key && parameters.key.length) this.outputBlock.consumer_key = parameters.key;
      if (!this.outputBlock.consumer_secret.length && parameters.secret && parameters.secret.length) this.outputBlock.consumer_secret = parameters.secret;
      this.rememberParameters = true;
    }
  }

  ionViewWillLeave() {
    if (!this.rememberParameters) {
      localStorage.setItem('woocommerce_parameters', null);
      return;
    }
    let parameters: WooCommerceParameters = {
      url: this.outputBlock.url_woocommerce,
      key: this.outputBlock.consumer_key,
      secret: this.outputBlock.consumer_secret
    }
    localStorage.setItem('woocommerce_parameters', JSON.stringify(parameters));
  }
}

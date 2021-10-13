import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { barcodeFormatModel } from '../../../models/barcode-format.model';
import { OutputBlockModel } from '../../../models/output-block.model';

@Component({
  selector: 'page-component-editor-barcode',
  templateUrl: 'component-editor-barcode.html',
})
export class ComponentEditorBarcodePage {
  public outputBlock: OutputBlockModel;

  public barcodeFormats: barcodeFormatModel[];
  public enableLimitBarcodeFormats = false;

  constructor(
    public navParams: NavParams,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    // Restore the ion-toggle state by reading the outputBlock.enabledFormats values
    this.barcodeFormats = JSON.parse(JSON.stringify(barcodeFormatModel.supportedBarcodeFormats));
    if (this.outputBlock.enabledFormats.length != 0) {
      this.barcodeFormats.forEach(barcodeFormat => {
        let enabledFormat = this.outputBlock.enabledFormats.find(x => x == barcodeFormat.name);
        if (enabledFormat) {
          barcodeFormat.enabled = true;
        } else {
          barcodeFormat.enabled = false;
        }
      });
      this.enableLimitBarcodeFormats = true;
    }
  }

  onEnableLimitBarcodeFormatsChange() {
    if (this.outputBlock.type == 'barcode') {
      if (!this.enableLimitBarcodeFormats) {
        // Restore the default formats values when the toggle button is enabled
        this.outputBlock.enabledFormats = [];
        this.barcodeFormats = JSON.parse(JSON.stringify(barcodeFormatModel.supportedBarcodeFormats));
      }
    }
  }

  onBarcodeFormatsChange() {
    // copy this.barcodeFormats values to the the outputBlock.enabledFormats
    this.outputBlock.enabledFormats = this.barcodeFormats.filter(x => x.enabled).map(x => x.name);
    this.enableLimitBarcodeFormats = true
  }
}

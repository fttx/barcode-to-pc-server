/**
 * Warning: this class is duplicated on the app side
 */
export class barcodeFormatModel {
  name: string;
  enabled: boolean;

  static supportedBarcodeFormats = [
    'QR_CODE', 'DATA_MATRIX', 'UPC_E', 'UPC_A', 'EAN_8', 'EAN_13', 'CODE_128', 'CODE_39', 'CODE_93', 'CODABAR', 'ITF', 'RSS14', 'RSS_EXPANDED', 'PDF_417', 'AZTEC', 'MSI',
    'CODE_32' // farmacode (italian subset of CODE_39)
  ].map((value, index) => {
    if (value == 'PDF_417' || value == 'RSS_EXPANDED' || value == 'CODE_32') {
      return new barcodeFormatModel(value, false)
    }
    return new barcodeFormatModel(value, true)
  });

  public equals(barcodeFormatModel): boolean {
    return this.name == barcodeFormatModel.name;
  }

  constructor(name: string, enabled: boolean) {
    this.name = name;
    this.enabled = enabled;
  }
}

import { Component, NgZone, ViewChild } from '@angular/core';
import { Events, NavParams, Platform, Select } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';

@Component({
  selector: 'page-component-editor-gsheet-update',
  templateUrl: 'component-editor-gsheet-update.html',
})
export class ComponentEditorGSheetUpdatePage {
  @ViewChild('sheetId') sheetId: Select;

  public curlyOpen = '{{';
  public curlyClose = '}}';
  public outputBlock: OutputBlockModel;
  public validationAttempted = false;

  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public platform: Platform,
    public events: Events,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');

    // Initialize googleSheetsValues if not present
    if (!this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = [];
    }

    // Initialize googleSheetsAction if not present
    if (!this.outputBlock.googleSheetsAction) {
      this.outputBlock.googleSheetsAction = 'append';
    }
    // Initialize googleSheetKeyColumn if not present (default to 'barcode')
    if (!this.outputBlock.googleSheetKeyColumn) {
      this.outputBlock.googleSheetKeyColumn = 'barcode';
    }

    // Ensure the first column is always barcode with {{ barcode }} value
    if (this.outputBlock.googleSheetsValues.length === 0) {
      this.outputBlock.googleSheetsValues = [{ column: 'barcode', value: '{{ barcode }}' }];
    } else {
      // Update existing first item to ensure it has the correct values
      this.outputBlock.googleSheetsValues[0] = { column: 'barcode', value: '{{ barcode }}' };
    }

    // Ensure at least one additional column is present for append action
    if (this.outputBlock.googleSheetsAction === 'append' && this.outputBlock.googleSheetsValues.length === 1) {
      this.outputBlock.googleSheetsValues = [...this.outputBlock.googleSheetsValues, { column: '', value: '' }];
    }
  }

  loadLocalStorage() {
  }

  ionViewDidEnter() {
  }

  ionViewDidLeave() {
  }

  isValid(): boolean {
    this.validationAttempted = true;

    // Validate that Google Sheets URL is provided
    if (!this.outputBlock.googleSheetsUrl || this.outputBlock.googleSheetsUrl.trim() === '') {
      return false;
    }

    // Validate that at least one column is present with both column name and value set
    if (!this.outputBlock.googleSheetsValues || this.outputBlock.googleSheetsValues.length === 0) {
      return false;
    }

    // For 'get' and 'delete' actions, only the barcode column is required
    if (this.outputBlock.googleSheetsAction === 'get' || this.outputBlock.googleSheetsAction === 'delete') {
      // Only need the first column (barcode), which is always valid
      return true;
    }

    // For 'append' and 'update' actions, need at least one additional column
    // If only barcode column exists, add an empty column and let validation fail
    if (this.outputBlock.googleSheetsValues.length === 1) {
      this.outputBlock.googleSheetsValues = [...this.outputBlock.googleSheetsValues, { column: '', value: '' }];
    }

    // Check that at least one column (beyond the first mandatory barcode column) has both column name and value filled
    // Skip index 0 since it's always valid (barcode column)
    const hasValidColumn = this.outputBlock.googleSheetsValues.slice(1).some(item =>
      item.column && item.column.trim() !== '' &&
      item.value && item.value.trim() !== ''
    );

    return hasValidColumn;
  }

  isUrlInvalid(): boolean {
    return this.validationAttempted && (!this.outputBlock.googleSheetsUrl || this.outputBlock.googleSheetsUrl.trim() === '');
  }

  isColumnNameInvalid(index: number): boolean {
    // First column (barcode) is always valid, never show as invalid
    if (index === 0) return false;

    if (!this.validationAttempted) return false;

    // For 'get' and 'delete' actions, additional columns are not required
    if (this.outputBlock.googleSheetsAction === 'get' || this.outputBlock.googleSheetsAction === 'delete') {
      return false;
    }

    const item = this.outputBlock.googleSheetsValues[index];
    if (!item) return false;

    // Check if there's at least one other column (excluding first and current) that is valid
    const hasOtherValidColumn = this.outputBlock.googleSheetsValues.some((otherItem, i) =>
      i !== index && i !== 0 && // Skip the first column and current column
      otherItem.column && otherItem.column.trim() !== '' &&
      otherItem.value && otherItem.value.trim() !== ''
    );

    // If there's another valid column, this field is optional
    if (hasOtherValidColumn) return false;

    // Otherwise, this column must be filled (for append/update actions)
    return !item.column || item.column.trim() === '';
  }

  isColumnValueInvalid(index: number): boolean {
    // First column (barcode) is always valid, never show as invalid
    if (index === 0) return false;

    if (!this.validationAttempted) return false;

    // For 'get' and 'delete' actions, additional columns are not required
    if (this.outputBlock.googleSheetsAction === 'get' || this.outputBlock.googleSheetsAction === 'delete') {
      return false;
    }

    const item = this.outputBlock.googleSheetsValues[index];
    if (!item) return false;

    // Check if there's at least one other column (excluding first and current) that is valid
    const hasOtherValidColumn = this.outputBlock.googleSheetsValues.some((otherItem, i) =>
      i !== index && i !== 0 && // Skip the first column and current column
      otherItem.column && otherItem.column.trim() !== '' &&
      otherItem.value && otherItem.value.trim() !== ''
    );

    // If there's another valid column, this field is optional
    if (hasOtherValidColumn) return false;

    // Otherwise, this column must be filled (for append/update actions)
    return !item.value || item.value.trim() === '';
  }

  addValue() {
    if (!this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = [];
    }
    // Use array assignment instead of push (push doesn't trigger change detection properly)
    this.outputBlock.googleSheetsValues = [...this.outputBlock.googleSheetsValues, { column: '', value: '' }];
  }

  removeValue(index: number) {
    // Never remove the first item (barcode column)
    if (index === 0) return;

    if (this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = this.outputBlock.googleSheetsValues.filter((x, i) => i !== index);
    }
  }
}

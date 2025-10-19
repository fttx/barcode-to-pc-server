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
  private previousValues: { column: string, value: string }[] = [];
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
    // Initialize googleSheetsSendAllVariables if not present
    if (this.outputBlock.googleSheetsSendAllVariables === undefined) {
      this.outputBlock.googleSheetsSendAllVariables = false;
    }
    // Initialize googleSheetKeyColumn if not present (default to 'barcode')
    if (!this.outputBlock.googleSheetKeyColumn) {
      this.outputBlock.googleSheetKeyColumn = 'barcode';
    }

    // Ensure at least one column is present for append action
    if (this.outputBlock.googleSheetsAction === 'append' && this.outputBlock.googleSheetsValues.length === 0) {
      this.outputBlock.googleSheetsValues = [{ column: '', value: '' }];
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

    // If "send all variables" is checked, just verify that value is set (column name can be empty/*)
    if (this.outputBlock.googleSheetsSendAllVariables) {
      return this.outputBlock.googleSheetsValues.some(item =>
        item.value && item.value.trim() !== ''
      );
    }

    // Check that at least one column has both column name and value filled
    const hasValidColumn = this.outputBlock.googleSheetsValues.some(item =>
      item.column && item.column.trim() !== '' &&
      item.value && item.value.trim() !== ''
    );

    return hasValidColumn;
  }

  isUrlInvalid(): boolean {
    return this.validationAttempted && (!this.outputBlock.googleSheetsUrl || this.outputBlock.googleSheetsUrl.trim() === '');
  }

  isColumnNameInvalid(index: number): boolean {
    if (!this.validationAttempted) return false;
    const item = this.outputBlock.googleSheetsValues[index];
    if (!item) return false;

    // If "send all variables" is checked, the column name can be empty (it will be "*")
    if (this.outputBlock.googleSheetsSendAllVariables) return false;

    // Check if this is the only column or if at least one other column is valid
    const hasOtherValidColumn = this.outputBlock.googleSheetsValues.some((otherItem, i) =>
      i !== index &&
      otherItem.column && otherItem.column.trim() !== '' &&
      otherItem.value && otherItem.value.trim() !== ''
    );

    // If there's another valid column, this field is optional
    if (hasOtherValidColumn) return false;

    // Otherwise, this column must be filled
    return !item.column || item.column.trim() === '';
  }

  isColumnValueInvalid(index: number): boolean {
    if (!this.validationAttempted) return false;
    const item = this.outputBlock.googleSheetsValues[index];
    if (!item) return false;

    // If "send all variables" is checked, value should be set to "{{ $ }}"
    if (this.outputBlock.googleSheetsSendAllVariables) {
      return !item.value || item.value.trim() === '';
    }

    // Check if this is the only column or if at least one other column is valid
    const hasOtherValidColumn = this.outputBlock.googleSheetsValues.some((otherItem, i) =>
      i !== index &&
      otherItem.column && otherItem.column.trim() !== '' &&
      otherItem.value && otherItem.value.trim() !== ''
    );

    // If there's another valid column, this field is optional
    if (hasOtherValidColumn) return false;

    // Otherwise, this column must be filled
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
    if (this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = this.outputBlock.googleSheetsValues.filter((x, i) => i !== index);
    }
  }

  onSendAllVariablesChange() {
    if (this.outputBlock.googleSheetsSendAllVariables) {
      // Save current values before replacing
      this.previousValues = [...this.outputBlock.googleSheetsValues];

      // Set single value to {{ $ }} when sending all variables
      this.outputBlock.googleSheetsValues = [{ column: '*', value: '{{ $ }}' }];
    } else {

      // Restore previous values when unchecking
      if (this.previousValues.length > 0) {
        this.outputBlock.googleSheetsValues = [...this.previousValues];
      } else {
        // If no previous values, initialize with one empty column
        this.outputBlock.googleSheetsValues = [{ column: '', value: '' }];
      }
    }
  }
}

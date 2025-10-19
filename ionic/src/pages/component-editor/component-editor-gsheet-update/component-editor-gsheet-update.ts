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

  public outputBlock: OutputBlockModel;
  private previousValues: { column: string, value: string }[] = [];

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

    // Initialize googleSheetsSearchValue if not present
    if (!this.outputBlock.googleSheetsSearchValue) {
      this.outputBlock.googleSheetsSearchValue = '{{ barcode }}';
    }

    // Initialize googleSheetsSendAllVariables if not present
    if (this.outputBlock.googleSheetsSendAllVariables === undefined) {
      this.outputBlock.googleSheetsSendAllVariables = false;
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
    // Validate that Google Sheets URL is provided
    if (!this.outputBlock.googleSheetsUrl || this.outputBlock.googleSheetsUrl.trim() === '') {
      return false;
    }

    // For append action, validate that either sendAllVariables is true or values are provided
    if (this.outputBlock.googleSheetsAction === 'append') {
      if (!this.outputBlock.googleSheetsSendAllVariables) {
        if (!this.outputBlock.googleSheetsValues || this.outputBlock.googleSheetsValues.length === 0) {
          return false;
        }

        // Validate each value has both column and value filled
        for (const item of this.outputBlock.googleSheetsValues) {
          if (!item.column || item.column.trim() === '' || !item.value || item.value.trim() === '') {
            return false;
          }
        }
      }
    }

    return true;
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
    console.log('onSendAllVariablesChange called');
    console.log('googleSheetsSendAllVariables:', this.outputBlock.googleSheetsSendAllVariables);
    console.log('Current googleSheetsValues:', JSON.stringify(this.outputBlock.googleSheetsValues));

    if (this.outputBlock.googleSheetsSendAllVariables) {
      // Save current values before replacing
      this.previousValues = [...this.outputBlock.googleSheetsValues];
      console.log('Saved previousValues:', JSON.stringify(this.previousValues));

      // Set single value to {{ $ }} when sending all variables
      this.outputBlock.googleSheetsValues = [{ column: '', value: '{{ $ }}' }];
      console.log('Set new googleSheetsValues:', JSON.stringify(this.outputBlock.googleSheetsValues));
    } else {
      console.log('Restoring previousValues:', JSON.stringify(this.previousValues));

      // Restore previous values when unchecking
      if (this.previousValues.length > 0) {
        this.outputBlock.googleSheetsValues = [...this.previousValues];
        console.log('Restored googleSheetsValues:', JSON.stringify(this.outputBlock.googleSheetsValues));
      } else {
        // If no previous values, initialize with one empty column
        this.outputBlock.googleSheetsValues = [{ column: '', value: '' }];
        console.log('Initialized with one empty column');
      }
    }
  }
}

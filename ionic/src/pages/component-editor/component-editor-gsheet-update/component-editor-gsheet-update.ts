import { Component, NgZone, ViewChild } from '@angular/core';
import { Events, NavParams, Platform, Select } from 'ionic-angular';
import { OutputBlockModel } from '../../../models/output-block.model';
import { ElectronProvider } from '../../../providers/electron/electron';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../../config';

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
  public checkingPermissions = false;
  public permissionsCheckResult: 'success' | 'error' | 'denied' | null = null;
  public availableColumns: string[] = [];
  private readonly STORAGE_KEY_PREFIX = 'gsheet_columns_';
  private formTouched = false;

  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public platform: Platform,
    public events: Events,
    private http: HttpClient,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');


    // Normalize old action values to new ones
    // 'append' was the old value, now it should be 'append_or_update'
    if ((this.outputBlock.googleSheetsAction as any) === 'append') {
      this.outputBlock.googleSheetsAction = 'append_or_update';
    }

    // Always initialize googleSheetsAction to 'append_or_update' if not set
    // This ensures the select box displays correctly
    if (!this.outputBlock.googleSheetsAction || this.outputBlock.googleSheetsAction.trim() === '') {
      this.outputBlock.googleSheetsAction = 'append_or_update';
    }

    // Initialize googleSheetsValues if not present
    if (!this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = [];
    }

    // Load available columns from localStorage first
    this.loadAvailableColumns();

    // Initialize googleSheetKeyColumn with first available column or 'barcode' as fallback
    if (!this.outputBlock.googleSheetKeyColumn || this.outputBlock.googleSheetKeyColumn.trim() === '') {
      if (this.availableColumns.length > 0) {
        this.outputBlock.googleSheetKeyColumn = this.availableColumns[0];
      } else {
        this.outputBlock.googleSheetKeyColumn = 'barcode';
      }
    }

    // Ensure the key column mapping is always present
    this.ensureKeyColumnInMapping();

    // Ensure at least one additional column is present for append_or_update action
    if (this.outputBlock.googleSheetsAction === 'append_or_update' && this.outputBlock.googleSheetsValues.length === 1) {
      const defaultColumn = this.availableColumns.length > 1 ? this.availableColumns[1] : (this.availableColumns.length > 0 ? this.availableColumns[0] : '');
      this.outputBlock.googleSheetsValues = [...this.outputBlock.googleSheetsValues, { column: defaultColumn, value: '' }];
    }

    // Force Angular to detect changes after initialization
    this.ngZone.run(() => {
      setTimeout(() => {
        // Change detection triggered
      }, 0);
    });
  }

  /**
   * Ensures that the key column is always present in the column mapping.
   * If not found, adds it at the beginning with default value "{{ barcode }}"
   */
  private ensureKeyColumnInMapping() {
    const keyColumn = this.outputBlock.googleSheetKeyColumn;

    // Don't add if key column is not set
    if (!keyColumn || keyColumn.trim() === '') {
      return;
    }

    // Check if key column exists in the mapping
    const hasKeyColumn = this.outputBlock.googleSheetsValues.some(item => item.column === keyColumn);

    if (!hasKeyColumn) {
      // Add key column at the beginning
      this.outputBlock.googleSheetsValues = [
        { column: keyColumn, value: '{{ barcode }}' },
        ...this.outputBlock.googleSheetsValues
      ];
    }
  }

  loadLocalStorage() {
  }

  ionViewDidEnter() {

    // Force set default action if still not set when view enters
    // Use setTimeout to ensure Angular change detection picks up the value
    setTimeout(() => {
      this.ngZone.run(() => {
        if (!this.outputBlock.googleSheetsAction || this.outputBlock.googleSheetsAction.trim() === '') {
          this.outputBlock.googleSheetsAction = 'append_or_update';
        }
      });
    }, 0);
  }

  ionViewDidLeave() {
  }

  private loadAvailableColumns() {
    if (this.outputBlock.googleSheetsUrl) {
      const storageKey = this.getStorageKey(this.outputBlock.googleSheetsUrl);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          this.availableColumns = JSON.parse(stored);
        } catch (e) {
          this.availableColumns = [];
        }
      }
    }
  }

  private saveAvailableColumns(columns: string[]) {
    if (this.outputBlock.googleSheetsUrl) {
      const storageKey = this.getStorageKey(this.outputBlock.googleSheetsUrl);
      localStorage.setItem(storageKey, JSON.stringify(columns));
      this.availableColumns = columns;

      // Auto-set first column for get_cell action if not already set
      if (this.outputBlock.googleSheetsAction === 'get_cell' && columns.length > 0) {
        if (!this.outputBlock.googleSheetsCellColumn || this.outputBlock.googleSheetsCellColumn.trim() === '') {
          this.outputBlock.googleSheetsCellColumn = columns[0];
        }
      }

      // Auto-set sequential columns for empty column mappings in append_or_update action
      if (this.outputBlock.googleSheetsAction === 'append_or_update' && columns.length > 0) {
        if (this.outputBlock.googleSheetsValues) {
          this.outputBlock.googleSheetsValues.forEach((item, index) => {
            // Skip if column is already set
            if (!item.column || item.column.trim() === '') {
              // Assign columns sequentially: index 0 gets columns[0], index 1 gets columns[1], etc.
              if (index < columns.length) {
                item.column = columns[index];
              } else {
                // If we run out of columns, wrap around or use the first column
                item.column = columns[0];
              }
            }
          });
        }
      }
    }
  }

  private getStorageKey(url: string): string {
    // Create a simple hash of the URL for the storage key
    return this.STORAGE_KEY_PREFIX + btoa(url).substring(0, 50);
  }

  isValid(): boolean {
    this.validationAttempted = true;

    // Allow dismissal if the form hasn't been touched (empty URL means untouched)
    if (!this.formTouched && (!this.outputBlock.googleSheetsUrl || this.outputBlock.googleSheetsUrl.trim() === '')) {
      return true;
    }

    // Ensure key column is in mapping before validation
    this.ensureKeyColumnInMapping();

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

    // For 'get_cell' action, need the cell column to be selected
    if (this.outputBlock.googleSheetsAction === 'get_cell') {
      return !!(this.outputBlock.googleSheetsCellColumn && this.outputBlock.googleSheetsCellColumn.trim() !== '');
    }

    // For 'append_or_update' action, need at least one additional column
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

    // For 'get', 'get_cell' and 'delete' actions, additional columns are not required
    if (this.outputBlock.googleSheetsAction === 'get' || this.outputBlock.googleSheetsAction === 'get_cell' || this.outputBlock.googleSheetsAction === 'delete') {
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

    // Otherwise, this column must be filled (for append_or_update action)
    return !item.column || item.column.trim() === '';
  }

  isColumnValueInvalid(index: number): boolean {
    // First column (barcode) is always valid, never show as invalid
    if (index === 0) return false;

    if (!this.validationAttempted) return false;

    // For 'get', 'get_cell' and 'delete' actions, additional columns are not required
    if (this.outputBlock.googleSheetsAction === 'get' || this.outputBlock.googleSheetsAction === 'get_cell' || this.outputBlock.googleSheetsAction === 'delete') {
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

    // Otherwise, this column must be filled (for append_or_update action)
    return !item.value || item.value.trim() === '';
  }

  addValue() {
    this.markFormAsTouched();
    if (!this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = [];
    }
    // Use array assignment instead of push (push doesn't trigger change detection properly)
    // Auto-set sequential column based on the current number of mappings
    const nextIndex = this.outputBlock.googleSheetsValues.length;
    let defaultColumn = '';

    if (this.availableColumns.length > 0) {
      // If we have enough columns, use the next sequential one
      if (nextIndex < this.availableColumns.length) {
        defaultColumn = this.availableColumns[nextIndex];
      } else {
        // If we run out of columns, wrap around or use the first column
        defaultColumn = this.availableColumns[0];
      }
    }

    this.outputBlock.googleSheetsValues = [...this.outputBlock.googleSheetsValues, { column: defaultColumn, value: '' }];
  }

  removeValue(index: number) {
    this.markFormAsTouched();
    // Never remove the first item (barcode column)
    if (index === 0) return;

    if (this.outputBlock.googleSheetsValues) {
      this.outputBlock.googleSheetsValues = this.outputBlock.googleSheetsValues.filter((x, i) => i !== index);
    }
  }

  async checkPermissions() {
    if (!this.outputBlock.googleSheetsUrl || this.outputBlock.googleSheetsUrl.trim() === '') {
      return;
    }

    this.checkingPermissions = true;
    this.permissionsCheckResult = null;

    try {
      // According to the API spec, we need minimal parameters: just sheetUrl
      const response: any = await this.http.post(
        Config.URL_GSHEET_BACKEND + '/sheet/info',
        {
          sheetUrl: this.outputBlock.googleSheetsUrl
        }
      ).toPromise();

      this.ngZone.run(() => {
        if (response && response.ok && response.sheets) {
          this.permissionsCheckResult = 'success';

          // Extract and save column names from the first sheet
          const sheetNames = Object.keys(response.sheets);
          if (sheetNames.length > 0) {
            const firstSheetColumns = response.sheets[sheetNames[0]];
            if (Array.isArray(firstSheetColumns) && firstSheetColumns.length > 0) {
              // Update key column BEFORE saving columns (to prevent conflicts)
              if (!this.outputBlock.googleSheetKeyColumn || this.outputBlock.googleSheetKeyColumn.trim() === '' || this.outputBlock.googleSheetKeyColumn === 'barcode') {
                this.outputBlock.googleSheetKeyColumn = firstSheetColumns[0];
              }

              // Now save columns which will auto-fill empty mappings
              this.saveAvailableColumns(firstSheetColumns);

              // Make sure we have exactly 2 items: key column + one additional column
              if (this.outputBlock.googleSheetsAction === 'append_or_update') {
                const keyColumn = this.outputBlock.googleSheetKeyColumn;

                // Reset to exactly 2 items:
                // 1. Key column with default barcode value
                // 2. Second column (if available) with empty value
                const secondColumn = firstSheetColumns.length > 1 ? firstSheetColumns[1] : '';

                this.outputBlock.googleSheetsValues = [
                  { column: keyColumn, value: '{{ barcode }}' },
                  { column: secondColumn, value: '' }
                ];
              }

              // Force change detection to update the select box display
              setTimeout(() => {
                this.ngZone.run(() => {
                  // Change detection triggered
                });
              }, 100);
            }
          }

          // Auto-clear success message after 3 seconds
          setTimeout(() => {
            this.ngZone.run(() => {
              if (this.permissionsCheckResult === 'success') {
                this.permissionsCheckResult = null;
              }
            });
          }, 3000);
        } else {
          this.permissionsCheckResult = 'denied';
        }
        this.checkingPermissions = false;
      });
    } catch (error) {
      this.ngZone.run(() => {
        // Check if error is 403/401 (denied) or other error
        if (error.status === 403 || error.status === 401) {
          this.permissionsCheckResult = 'denied';
        } else {
          this.permissionsCheckResult = 'error';
        }
        this.checkingPermissions = false;
      });
    }
  }

  openTutorial() {
    this.electronProvider.shell.openExternal(Config.URL_TUTORIAL_GOOGLE_SHEETS);
  }

  onUrlPaste() {
    this.markFormAsTouched();
    // Use setTimeout to allow the ngModel to update first
    setTimeout(() => {
      if (this.outputBlock.googleSheetsUrl && this.outputBlock.googleSheetsUrl.trim() !== '') {
        this.checkPermissions();
      }
    }, 100);
  }

  onUrlChange() {
    this.markFormAsTouched();
  }

  markFormAsTouched() {
    this.formTouched = true;
  }
}

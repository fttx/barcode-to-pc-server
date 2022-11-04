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
  public availableSheets = [];
  public isLoading = false;
  public savedTokens: any = null;
  public hideTokenInput = true;
  public redirectToken = '';
  public validated = false;

  constructor(
    public navParams: NavParams,
    public electronProvider: ElectronProvider,
    public ngZone: NgZone,
    public platform: Platform,
    public events: Events,
  ) {
    this.outputBlock = this.navParams.get('outputBlock');
    this.loadLocalStorage();
  }

  loadLocalStorage() {
    this.savedTokens = JSON.parse(localStorage.getItem('gsheet_saved_tokens'));
    this.availableSheets = JSON.parse(localStorage.getItem('gsheet_available_sheets'));
  }

  ionViewDidEnter() {
    this.sheetId.selectOptions = { cssClass: 'alert-gsheet-sheets-list' };
    this.loadLocalStorage();


    // There is another listener on the app.component.ts to refresh & save the token from time to time
    this.electronProvider.ipcRenderer.on('gsheet_refresh_tokens', this.refreshTokens);

    // Here is used the same topic to send and receive messages
    this.electronProvider.ipcRenderer.on('gsheet_refresh_data', (event, data: { tokens: any, spreadSheets: ({ id: string, name: string }[]) }) => {
      this.ngZone.run(() => {
        if (data.tokens) {
          this.savedTokens = data.tokens;
          localStorage.setItem('gsheet_saved_tokens', JSON.stringify(this.savedTokens));
        }
        this.availableSheets = data.spreadSheets;
        localStorage.setItem('gsheet_available_sheets', JSON.stringify(this.availableSheets));
        setTimeout(() => {
          this.sheetId.open();
          this.isLoading = false;
        }, 500);
      });
    });

    console.log('ionViewDidEnter ComponentEditorGSheetUpdatePage');
  }

  ionViewDidLeave() {
    this.electronProvider.ipcRenderer.removeListener('gsheet_refresh_tokens', this.refreshTokens); // there is another listener always registered that periodically refreshes the token on the app.component.ts
    this.electronProvider.ipcRenderer.removeAllListeners('gsheet_refresh_data');
  }

  logout() {
    this.savedTokens = null;
    this.availableSheets = [];
    this.outputBlock.sheetId = '';
    localStorage.removeItem('gsheet_saved_tokens');
    localStorage.removeItem('gsheet_available_sheets');
    setTimeout(() => {
      this.hideTokenInput = true;
      this.redirectToken = '';
      this.events.publish('componentEditor:scrollToTop');
    }, 600);
  }

  refreshData() {
    this.isLoading = true;
    this.hideTokenInput = false;
    setTimeout(() => { this.isLoading = false; }, 30000);
    // Here is used the same topic to send and receive messages
    this.electronProvider.ipcRenderer.send('gsheet_refresh_data', { tokens: this.savedTokens, spreadSheets: null });
  }

  refreshTokens(event, tokens: any) {
    this.ngZone.run(() => { this.savedTokens = tokens; });
  }

  isLoggedIn() {
    return this.savedTokens && this.savedTokens.expiry_date && this.savedTokens.expiry_date != null;
  }

  onActionChange(event) {
    if (this.outputBlock.action === 'get' && this.outputBlock.rowToUpdate === 'all') {
      this.outputBlock.rowToUpdate = 'first';
    }
  }

  addColumn() {
    this.outputBlock.columnsToAppend = [...this.outputBlock.columnsToAppend, ''];
    this.events.publish('componentEditor:scrollToBottom');
  }

  removeColumn(removeIndex: number) {
    this.outputBlock.columnsToAppend = this.outputBlock.columnsToAppend.filter((x, index) => index != removeIndex);
    this.events.publish('componentEditor:scrollToBottom');
  }

  // When the token is pasted in the UI
  onRedirectTokenChange(event) {
    this.electronProvider.ipcRenderer.send('oauth_token', this.redirectToken);
  }

  isValid() {
    return this.outputBlock.sheetId && this.outputBlock.sheetId.length;
  }
}

import { ipcMain } from 'electron';
import * as http from 'http';
import { ReplaySubject } from 'rxjs';
import * as WebSocket from 'ws';
import { SettingsModel } from '../../../ionic/src/models/settings.model';
import { StringComponentModel } from '../../../ionic/src/models/string-component.model';
import { Config } from '../config';
import { Handler } from '../models/handler.model';
import ElectronStore = require('electron-store');

export class SettingsHandler implements Handler {
    public onSettingsChanged: ReplaySubject<SettingsModel> = new ReplaySubject<SettingsModel>(); // triggered after the page load and on every setting change. See ElectronProvider.
    private settings: SettingsModel;

    private static instance: SettingsHandler;
    private store: ElectronStore;

    private constructor() {
        this.store = new ElectronStore();
        // this communication is needed because electronStore.onDidChange() triggers only within the same process
        ipcMain.on('settings', (event, arg) => {
            this.settings = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel())
            this.onSettingsChanged.next(this.settings);
        });
    }

    static getInstance() {
        if (!SettingsHandler.instance) {
            SettingsHandler.instance = new SettingsHandler();
        }
        return SettingsHandler.instance;
    }

    // TODO: remove those pass thrugh methods
    get enableRealtimeStrokes(): boolean {
        return this.settings.enableRealtimeStrokes
    }
    get enableOpenInBrowser(): boolean {
        return this.settings.enableOpenInBrowser
    }
    get typedString(): StringComponentModel[] {
        return this.settings.typedString
    }
    get quantityEnabled(): boolean {
        return this.settings.typedString.findIndex(x => x.value == 'quantity') != -1;
    }
    get newLineCharacter(): string {
        return this.settings.newLineCharacter
    }
    get enableQuotes(): boolean {
        return this.settings.enableQuotes
    }
    get enableTray(): boolean {
        return this.settings.enableTray
    }
    get csvPath(): string {
        return this.settings.csvPath
    }
    get appendCSVEnabled(): boolean {
        return this.settings.appendCSVEnabled
    }
    get typeMethod() {
        return this.settings.typeMethod
    }
    get autoUpdate() {
        return this.settings.autoUpdate
    }

    onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage) {
        throw new Error("Method not implemented.");
    }
    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }
    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }
}
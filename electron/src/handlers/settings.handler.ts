import { ipcMain } from 'electron';
import * as http from 'http';
import { ReplaySubject } from 'rxjs';
import * as WebSocket from 'ws';
import { OutputProfileModel } from '../models/ionic/output-profile.model';
import { SettingsModel } from '../models/ionic/settings.model';
import { Config } from '../config';
import { Handler } from '../models/handler.model';
import ElectronStore = require('electron-store');
import { machineIdSync } from 'node-machine-id';
import { v4 } from 'uuid';
import * as os from 'os'

export class SettingsHandler implements Handler {
    public onSettingsChanged: ReplaySubject<SettingsModel> = new ReplaySubject<SettingsModel>(); // triggered after the page load and on every setting change. See ElectronProvider.
    private settings: SettingsModel;

    private static instance: SettingsHandler;
    private store: ElectronStore;

    private constructor() {
        this.store = new ElectronStore();
        // this communication is needed because electronStore.onDidChange() triggers only within the same process
        ipcMain.on('settings', (event, arg) => {
            const settings: any = this.store.get(Config.STORAGE_SETTINGS, new SettingsModel(os.platform().toLowerCase()));
            this.settings = settings;
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
    get outputProfiles(): OutputProfileModel[] {
        return this.settings.outputProfiles
    }
    get newLineCharacter(): string {
        return this.settings.newLineCharacter
    }
    get csvDelimiter(): string {
        return this.settings.csvDelimiter
    }
    get exportOnlyText(): boolean {
        return this.settings.exportOnlyText
    }
    get enableQuotes(): boolean {
        return this.settings.enableQuotes
    }
    get enableHeaders(): boolean {
        return this.settings.enableHeaders
    }
    get enableTray(): boolean {
        return this.settings.enableTray
    }
    get openAutomatically(): ('yes' | 'no' | 'minimized') {
        return this.settings.openAutomatically
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
    get onSmartphoneChargeCommand() {
        return this.settings.onSmartphoneChargeCommand
    }
    get savedGeoLocations() {
        return this.store.get(Config.STORAGE_SAVED_GEOLOCATIONS, []);
    }
    get autoDelayMs() {
        return this.settings.autoDelayMs;
    }
    async onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage): Promise<any> {
        throw new Error("Method not implemented.");
        return message;
    }
    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }
    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }

    // Duplicated code in the electron.ts file
    public getServerUUID(): string {
        try {
            return machineIdSync();
        } catch {
            let uuid: any;
            uuid = this.store.get('uuid', null);
            if (uuid == null) {
                uuid = v4();
                this.store.set('uuid', uuid);
            }
            return uuid;
        }
    }
}

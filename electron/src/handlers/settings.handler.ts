import { ipcMain } from 'electron';
import { Subject } from 'rxjs/Subject';
import * as WebSocket from 'ws';

import { Handler } from '../models/handler.model';
import { SettingsModel } from '../../../ionic/src/models/settings.model';
import { StringComponentModel } from '../../../ionic/src/models/string-component.model';


export class SettingsHandler implements Handler {
    public onSettingsChanged: Subject<SettingsModel> = new Subject<SettingsModel>(); // triggered after the page load and on every setting change. See ElectronProvider.
    private settings: SettingsModel;

    private static instance: SettingsHandler;
    private constructor() {
        ipcMain.on('settings', (event, arg) => {
            // console.log('settings received', arg)
            this.settings = arg;
            this.onSettingsChanged.next(this.settings);
        });
    }

    static getInstance() {
        if (!SettingsHandler.instance) {
            SettingsHandler.instance = new SettingsHandler();
        }
        return SettingsHandler.instance;
    }

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

    onWsMessage(ws: WebSocket, message: any) {
        throw new Error("Method not implemented.");
    }
    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }
    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }
}
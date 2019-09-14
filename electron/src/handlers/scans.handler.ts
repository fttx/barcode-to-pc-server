import { clipboard, dialog, shell } from 'electron';
import * as fs from 'fs';
import * as http from 'http';
import * as robotjs from 'robotjs';
import { isNumeric } from 'rxjs/util/isNumeric';
import * as WebSocket from 'ws';
import { requestModel, requestModelHelo, requestModelPutScanSessions } from '../../../ionic/src/models/request.model';
import { responseModelPutScanAck } from '../../../ionic/src/models/response.model';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';
import { UiHandler } from './ui.handler';
import { ScanModel } from '../../../ionic/src/models/scan.model';
import * as Papa from 'papaparse';
import axios from 'axios';
import * as Supplant from 'supplant';
import { strict } from 'assert';

export class ScansHandler implements Handler {
    private static instance: ScansHandler;
    private constructor(
        private settingsHandler: SettingsHandler,
        private uiHandler: UiHandler,
    ) {

    }

    static getInstance(settingsHandler: SettingsHandler, uiHandler: UiHandler) {
        if (!ScansHandler.instance) {
            ScansHandler.instance = new ScansHandler(settingsHandler, uiHandler);
        }
        return ScansHandler.instance;
    }

    onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage) {
        // console.log('message', message)
        switch (message.action) {
            case requestModel.ACTION_PUT_SCAN_SESSIONS: {
                let request: requestModelPutScanSessions = message;
                if (request.scanSessions.length == 0 ||
                    (request.scanSessions.length == 1 && request.scanSessions[0].scannings && request.scanSessions[0].scannings.length != 1) ||
                    request.scanSessions.length > 1
                ) { // checks for at least 1 scan inside the request
                    return;
                }

                // at the moment the server supports only one scanSession and one scan per request
                let scanSession = request.scanSessions[0];
                let scan = scanSession.scannings[0];

                // keyboard emulation
                (async () => {
                    for (let outputBlock of scan.outputBlocks) {
                        switch (outputBlock.type) {
                            case 'key': this.keyTap(outputBlock.value, outputBlock.modifiers); break;
                            case 'text': this.typeString(outputBlock.value); break;
                            case 'variable': this.typeString(outputBlock.value); break;
                            case 'function': this.typeString(outputBlock.value); break;
                            case 'barcode': this.typeString(outputBlock.value); break;
                            case 'delay': {
                                if (isNumeric(outputBlock.value)) {
                                    await new Promise(resolve => setTimeout(resolve, parseInt(outputBlock.value)))
                                }
                                break;
                            }
                            case 'http': {
                                axios.request({ url: outputBlock.value, method: outputBlock.method });
                                break;
                            }
                        } // end switch
                    } // end for
                })();

                // append to csv
                if (this.settingsHandler.appendCSVEnabled && this.settingsHandler.csvPath) {
                    let newLineCharacter = this.settingsHandler.newLineCharacter.replace('CR', '\r').replace('LF', '\n');
                    let rows = ScanModel.ToCSV(
                        scanSession.scannings,
                        this.settingsHandler.exportOnlyText,
                        this.settingsHandler.enableQuotes,
                        this.settingsHandler.csvDelimiter,
                        newLineCharacter
                    );

                    // prepare device_name variable
                    let deviceName = 'Please add a DEVICE_NAME component to the Output template';
                    let deviceNameOutputBlock = scanSession.scannings[0].outputBlocks.find(x => x.name.toLowerCase() == 'device_name');
                    if (typeof (deviceNameOutputBlock) != "undefined") {
                        deviceName = deviceNameOutputBlock.value;
                    }

                    // inject variables to the path
                    let path = new Supplant().text(this.settingsHandler.csvPath, {
                        scan_session_name: this.sanitize(scanSession.name),
                        device_name: this.sanitize(deviceName),
                        date: this.sanitize(new Date(scanSession.date).toISOString().slice(0, 10).replace(/-/g, ""))
                    })

                    fs.appendFileSync(path, rows + newLineCharacter);
                }

                if (this.settingsHandler.enableOpenInBrowser) {
                    shell.openExternal(ScanModel.ToString(scan));
                }

                // ACK
                let response = new responseModelPutScanAck();
                response.fromObject({
                    scanId: scan.id,
                    scanSessionId: scanSession.id
                });
                ws.send(JSON.stringify(response));
                // END ACK
                break;
            }

            case requestModel.ACTION_HELO: {
                let request: requestModelHelo = message;
                break;
            }
        }
    }

    keyTap(key, modifiers) {
        if (!this.settingsHandler.enableRealtimeStrokes || !key) {
            return;
        }
        robotjs.keyTap(key, modifiers);
    }

    typeString(string) {
        if (!this.settingsHandler.enableRealtimeStrokes || !string) {
            return;
        }

        if (this.settingsHandler.typeMethod == 'keyboard') {
            robotjs.typeString(string);
        } else {
            var ctrlKey = process.platform === "darwin" ? "command" : "control";
            clipboard.writeText(string);
            robotjs.keyTap("v", ctrlKey);
        }
    }

    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }

    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns the str without special characters only numbers, letters and
     * spaces.
     *
     * @param str String to sanitize
     */
    sanitize(str) {
        return str.replace(/[^a-z0-9\s]/gi, '');
    }
}

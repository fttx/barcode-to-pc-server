import axios from 'axios';
import { exec, execSync } from 'child_process';
import { clipboard, dialog, shell } from 'electron';
import * as fs from 'fs';
import * as http from 'http';
import * as os from 'os';
import * as robotjs from 'robotjs';
import { isNumeric } from 'rxjs/util/isNumeric';
import * as Supplant from 'supplant';
import * as WebSocket from 'ws';
import { requestModel, requestModelHelo, requestModelOnSmartphoneCharge, requestModelPutScanSessions } from '../../../ionic/src/models/request.model';
import { responseModelPutScanAck } from '../../../ionic/src/models/response.model';
import { ScanModel } from '../../../ionic/src/models/scan.model';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';
import { UiHandler } from './ui.handler';

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

    async onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage): Promise<any> {
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

                // Set this variable to TRUE when an outputBlock.value is changed from the server
                // This way the ACK response will communicate to the app the updated scan value.
                let outputBloksValueChanged = false;

                // keyboard emulation
                for (let outputBlock of scan.outputBlocks) {
                    if (outputBlock.skipOutput && outputBlock.type != 'http' && outputBlock.type != 'run') {
                        continue;
                    }

                    switch (outputBlock.type) {
                        case 'key': this.keyTap(outputBlock.value, outputBlock.modifiers); break;
                        case 'text': this.typeString(outputBlock.value); break;
                        case 'variable': this.typeString(outputBlock.value); break;
                        case 'function': this.typeString(outputBlock.value); break;
                        case 'barcode': this.typeString(outputBlock.value); break;
                        case 'select_option': this.typeString(outputBlock.value); break;
                        case 'delay': {
                            if (isNumeric(outputBlock.value)) {
                                await new Promise(resolve => setTimeout(resolve, parseInt(outputBlock.value)))
                            }
                            break;
                        }
                        case 'http': {
                            console.log('HTTP: ', outputBlock)
                            if (outputBlock.skipOutput) {
                                axios.request({ url: outputBlock.value, method: outputBlock.method, timeout: 10000 });
                            } else {
                                try {
                                    let response = (await axios.request({ url: outputBlock.value, method: outputBlock.method, timeout: 10000 })).data;
                                    if (typeof response == 'object') {
                                        response = JSON.stringify(response);
                                    }
                                    outputBlock.value = response;
                                    message = request;
                                    this.typeString(outputBlock.value)
                                } catch (error) {
                                    // Do not change the value when the request fails to allow the Send again feature to work
                                    // if (error.code) {
                                    //      if (error.code == 'ECONNREFUSED') outputBlock.value = 'Connection refused';
                                    // }
                                }
                                outputBloksValueChanged = true;
                            }
                            break;
                        }
                        case 'run': {
                            if (outputBlock.skipOutput) {
                                exec(outputBlock.value, { cwd: os.homedir(), timeout: 10000 })
                            } else {
                                try {
                                    outputBlock.value = execSync(outputBlock.value, { cwd: os.homedir(), timeout: 10000, maxBuffer: 1024 }).toString();
                                    this.typeString(outputBlock.value)
                                } catch (error) {
                                    // Do not change the value when the command fails to allow the Send again feature to work
                                    // if (error.code) {
                                    //     if (error.code == 'ETIMEDOUT') outputBlock.value = 'Timeout. Max allowed 10 seconds';
                                    //     if (error.code == 'ENOBUFS') outputBlock.value = 'Too much output. Max allowed 1024 bytes';
                                    // }
                                }
                                outputBloksValueChanged = true;
                            }
                            break;
                        }
                    } // end switch
                } // end for

                // Append to csv
                if (this.settingsHandler.appendCSVEnabled && this.settingsHandler.csvPath) {
                    let newLineCharacter = this.settingsHandler.newLineCharacter.replace('CR', '\r').replace('LF', '\n');
                    let rows = ScanModel.ToCSV(
                        scanSession.scannings, // Warning: contains only the last scan
                        this.settingsHandler.exportOnlyText,
                        this.settingsHandler.enableQuotes,
                        this.settingsHandler.csvDelimiter,
                        newLineCharacter
                    );

                    // Inject variables to the file path
                    let variables = {
                        barcode: null, // ''
                        // barcodes: [],
                        number: null,
                        text: null,
                        timestamp: (scanSession.date * 1000),
                        date: new Date(scanSession.date).toISOString().slice(0, 10),
                        time: new Date(scanSession.date).toLocaleTimeString().replace(/:/g, '-'),
                        scan_session_name: scanSession.name,
                        device_name: null,
                        select_option: null,
                    };
                    // Search if there is a corresponding Output component to assign to the NULL variables
                    let keys = Object.keys(variables);
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        if (variables[key] === null) {
                            let value = 'Add a ' + key.toUpperCase() + ' component to the Output template';
                            let outputBlock = scanSession.scannings[0].outputBlocks.find(x => x.name.toLowerCase() == key);
                            if (typeof (outputBlock) != "undefined") {
                                value = outputBlock.value;
                            }
                            variables[key] = value;
                        }
                    }
                    // Finally supplant the variables to the file path
                    let path = new Supplant().text(this.settingsHandler.csvPath, variables)

                    try {
                        if (rows.length != 0) {
                            fs.appendFileSync(path, rows + newLineCharacter);
                        }
                    } catch (e) {
                        dialog.showMessageBox(this.uiHandler.mainWindow, {
                            type: 'error',
                            title: 'Write error',
                            buttons: ['OK'],
                            message: "An error occurred while appending the scan to the specified CSV file. Please make you sure that the file name doesn't contain special characters and that the server has the write permissions to that path"
                        });
                    }
                }

                if (this.settingsHandler.enableOpenInBrowser) {
                    shell.openExternal(ScanModel.ToString(scan));
                }

                let updatedOutputBloks = null;
                if (outputBloksValueChanged) {
                    updatedOutputBloks = scan.outputBlocks;
                    scan.displayValue = ScanModel.ToString(scan);
                    message = request;
                }

                // ACK
                let response = new responseModelPutScanAck();
                response.fromObject({
                    scanId: scan.id,
                    scanSessionId: scanSession.id,
                    outputBlocks: updatedOutputBloks,
                });
                ws.send(JSON.stringify(response));
                // END ACK
                break;
            }

            case requestModel.ACTION_ON_SMARTPHONE_CHARGE:
                let request: requestModelOnSmartphoneCharge = message;
                exec(this.settingsHandler.onSmartphoneChargeCommand, { cwd: os.homedir() })
                break;

            case requestModel.ACTION_HELO: {
                let request: requestModelHelo = message;
                break;
            }
        }
        return message;
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
}

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


export class ScansHandler implements Handler {
    private deviceNames = {};

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
        console.log('message', message)
        switch (message.action) {
            case requestModel.ACTION_PUT_SCAN_SESSIONS: {
                let request: requestModelPutScanSessions = message;
                if (request.scanSessions.length == 0 ||
                    (request.scanSessions.length == 1 && request.scanSessions[0].scannings && request.scanSessions[0].scannings.length != 1) ||
                    request.scanSessions.length > 1
                ) { // checks for at least 1 scan inside the request
                    return;
                }

                let scanSession = request.scanSessions[0];
                let scan = scanSession.scannings[0];
                let barcode = scan.text;

                (async () => {
                    let csvOut = '';
                    for (let stringComponent of this.settingsHandler.typedString) {
                        let outputString;

                        switch (stringComponent.type) {
                            case 'barcode': {
                                outputString = barcode;
                                break;
                            }
                            case 'text': {
                                outputString = stringComponent.value;
                                break;
                            }
                            case 'key': {
                                if (this.settingsHandler.enableRealtimeStrokes) {
                                    robotjs.keyTap(stringComponent.value);
                                }

                                if (stringComponent.value == 'tab') {
                                    csvOut += '\t';
                                }
                                break;
                            }
                            case 'variable': {
                                switch (stringComponent.value) {
                                    case 'deviceName': {
                                        outputString = this.deviceNames[req.connection.remoteAddress];
                                        break;
                                    }

                                    case 'timestamp': {
                                        outputString = (scan.date * 1000) + ' ';
                                        break;
                                    }

                                    case 'date': {
                                        outputString = new Date(scan.date).toLocaleDateString();
                                        break;
                                    }

                                    case 'time': {
                                        outputString = new Date(scan.date).toLocaleTimeString();
                                        break;
                                    }

                                    case 'date_time': {
                                        outputString = new Date(scan.date).toLocaleTimeString() + ' ' + new Date(scan.date).toLocaleDateString();
                                        break;
                                    }

                                    case 'quantity': {
                                        if (scan.quantity) {
                                            outputString = scan.quantity + '';
                                        } else {
                                            // electron popup: invalid quantity, please enable quantity in the app and insert a numeric value.
                                            dialog.showMessageBox(null, {
                                                type: 'error',
                                                title: 'Invalid quantity',
                                                message: 'Please make you sure to enter a quantity in the app',
                                            });
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                            case 'function': {
                                try {
                                    // Typescript transpiles local variables such **barcode** and changes their name.
                                    // When eval() gets called it doesn't find the **barcode** variable and throws a syntax error.
                                    // To prevent that i store the barcode inside the variable **global** which doesn't change.
                                    // I use the scan.id as index insted of a fixed string to enforce mutual exclusion
                                    global[scan.id] = barcode;
                                    let code = stringComponent.value.replace(/barcode/g, 'global[' + scan.id + ']'); // i put the index like a literal, since scan.id can be transpiled too
                                    outputString = eval(code);
                                    delete global[scan.id];
                                    // Note:
                                    //     The previous solution: stringComponent.value.replace('barcode', '"' + barcode + '"');
                                    //     didn't always work because the **barcode** value is treated as a string immediately. 
                                    //
                                    //  ie:
                                    //
                                    //     "this is
                                    //        as test".replace(...)
                                    // 
                                    //     doesn't work because the first line doesn't have the ending \ character.
                                } catch (e) {
                                    dialog.showMessageBox(null, {
                                        type: 'error',
                                        title: stringComponent.name + ' error',
                                        message: 'The ' + stringComponent.name + ' component contains an error: \n' + e,
                                    });
                                }
                                break;
                            }

                            case 'delay': {
                                if (isNumeric(stringComponent.value)) {
                                    await new Promise((resolve) => {
                                        setTimeout(resolve, parseInt(stringComponent.value))
                                    })
                                }
                                break;
                            }
                        }
                        if (outputString) {
                            csvOut += outputString;
                        }
                        if (this.settingsHandler.enableRealtimeStrokes) {
                            this.typeString(outputString);
                        }
                    } // end for
                    if (this.settingsHandler.appendCSVEnabled) {
                        let newLineCharacter = this.settingsHandler.newLineCharacter.replace('CR', '\r').replace('LF', '\n');
                        this.appendToCSVFile(csvOut + newLineCharacter);
                    }
                })();

                if (this.settingsHandler.enableOpenInBrowser) {
                    shell.openExternal(barcode);
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
                if (request && request.deviceName) {
                    this.deviceNames[req.connection.remoteAddress] = request.deviceName;
                }
                break;
            }
        }
    }

    typeString(string) {
        if (!string) {
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

    appendToCSVFile(text: string) {
        if (this.settingsHandler.appendCSVEnabled && this.settingsHandler.csvPath) {
            fs.appendFileSync(this.settingsHandler.csvPath, text);
        }
    }

    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }

    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }
}

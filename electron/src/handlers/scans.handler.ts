import { shell } from 'electron';
import * as robotjs from 'robotjs';
import { isNumeric } from 'rxjs/util/isNumeric';
import * as WebSocket from 'ws';

import { requestModel, requestModelHelo, requestModelPutScan } from '../../../ionic/src/models/request.model';
import { responseModelPutScanAck } from '../../../ionic/src/models/response.model';
import { StringComponentModel } from '../../../ionic/src/models/string-component.model';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';

export class ScansHandler implements Handler {
    private deviceName = "unknown";

    private static instance: ScansHandler;
    private constructor(
        private settingsHandler: SettingsHandler,
    ) {

    }
    static getInstance(settingsHandler: SettingsHandler) {
        if (!ScansHandler.instance) {
            ScansHandler.instance = new ScansHandler(settingsHandler);
        }
        return ScansHandler.instance;
    }

    onWsMessage(ws: WebSocket, message: any) {
        console.log('message', message)
        switch (message.action) {
            case requestModel.ACTION_PUT_SCAN: {
                let request: requestModelPutScan = message;
                let barcode = request.scan.text;

                if (this.settingsHandler.enableRealtimeStrokes) {
                    (async () => {
                        for (let stringComponent of this.settingsHandler.typedString) {
                            switch (stringComponent.type) {
                                case 'barcode': {
                                    robotjs.typeString(barcode);
                                    break;
                                }
                                case 'text': {
                                    robotjs.typeString(stringComponent.value);
                                    break;
                                }
                                case 'key': {
                                    robotjs.keyTap(stringComponent.value);
                                    break;
                                }
                                case 'variable': {
                                    let typedValue = 'unknown';
                                    switch (stringComponent.value) {
                                        case 'deviceName': {
                                            typedValue = this.deviceName;
                                            break;
                                        }

                                        case 'timestamp': {
                                            typedValue = (request.scan.date * 1000) + ' ';
                                            break;
                                        }

                                        case 'date': {
                                            typedValue = new Date(request.scan.date).toLocaleDateString();
                                            break;
                                        }

                                        case 'time': {
                                            typedValue = new Date(request.scan.date).toLocaleTimeString();
                                            break;
                                        }

                                        case 'date_time': {
                                            typedValue = new Date(request.scan.date).toLocaleTimeString() + ' ' + new Date(request.scan.date).toLocaleDateString();
                                            break;
                                        }
                                    }
                                    robotjs.typeString(typedValue);
                                    break;
                                }
                                case 'function': {
                                    let typedString = stringComponent.value.replace('barcode', '"' + barcode + '"');
                                    robotjs.typeString(eval(typedString));
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
                        }
                    })();
                }

                if (this.settingsHandler.enableOpenInBrowser) {
                    shell.openExternal(barcode);
                }

                // ACK
                let response = new responseModelPutScanAck();
                response.fromObject({
                    scanId: request.scan.id,
                    scanSessionId: request.scanSessionId
                });
                ws.send(JSON.stringify(response));
                // END ACK
                break;
            }

            case requestModel.ACTION_PUT_SCAN_SESSIONS: {

                break;
            }

            case requestModel.ACTION_PUT_SCAN_SESSION: {

                break;
            }

            case requestModel.ACTION_DELETE_SCAN_SESSION: {

                break;
            }

            case requestModel.ACTION_UPDATE_SCAN_SESSION: {

                break;
            }

            case requestModel.ACTION_HELO: {
                let request: requestModelHelo = message;
                if (request && request.deviceName) {
                    this.deviceName = request.deviceName;
                }
                break;
            }
        }
    }

    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }

    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }
}
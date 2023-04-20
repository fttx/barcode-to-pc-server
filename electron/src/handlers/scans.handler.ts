import axios from 'axios';
import addOAuthInterceptor from 'axios-oauth-1.0a';
import { exec, execSync } from 'child_process';
import * as parse from 'csv-parse/lib/sync';
import * as stringify from 'csv-stringify';
import { clipboard, dialog, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import { keyboard, Key } from '@nut-tree/nut-js';
import { isNumeric } from 'rxjs/util/isNumeric';
import { lt, SemVer } from 'semver';
import * as Supplant from 'supplant';
import * as WebSocket from 'ws';
import { requestModel, requestModelHelo, requestModelOnSmartphoneCharge, requestModelPutScanSessions, requestModelRemoteComponent } from '../models/ionic/request.model';
import { responseModelPutScanAck, responseModelRemoteComponentResponse } from '../models/ionic/response.model';
import { ScanModel } from '../models/ionic/scan.model';
import { Config } from '../config';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';
import { UiHandler } from './ui.handler';
import { GSheetHandler } from './gsheet.handler';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export class ScansHandler implements Handler {
    private static instance: ScansHandler;
    private devices = {};
    private ipcClient;

    private constructor(
        private settingsHandler: SettingsHandler,
        private uiHandler: UiHandler,
        private gsheet: GSheetHandler,
    ) {
        keyboard.config.autoDelayMs = 0;
    }

    static getInstance(settingsHandler: SettingsHandler, uiHandler: UiHandler, gsheet: GSheetHandler) {
        if (!ScansHandler.instance) {
            ScansHandler.instance = new ScansHandler(settingsHandler, uiHandler, gsheet);
        }
        return ScansHandler.instance;
    }

    async onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage): Promise<any> {
        // console.log('message', message)
        switch (message.action) {
            case requestModel.ACTION_PUT_SCAN_SESSIONS: {
                let request: requestModelPutScanSessions = message;

                // Prevent malformed requests
                // At the moment the server supports only one scanSession at a time
                if (request.scanSessions.length != 1) {
                    return message;
                }

                // If there are more than one scan inside the session it means
                // that it's a request to sync an archieved scanSession,
                // So we can skip executing the output template.
                //
                // Note: perhaps do a separate request would be a better solution?
                if (request.scanSessions.length == 1 && request.scanSessions[0].scannings && request.scanSessions[0].scannings.length != 1) {
                    // What if the archived scanSession contains a scan with ack = false?
                    // For example it would imply that the RUN component has never been executed.
                    // Workaround: discard these scans and let the user sync them using the sync button.
                    //             the app will continue to display the (!) red mark.
                    request.scanSessions = request.scanSessions.map(x => {
                        x.scannings = x.scannings.filter(x => x.ack);
                        return x;
                    })
                        // If the scanSessions contains ALL .ack = false, then discard the enteire scan session to avoid empty user interface.
                        .filter(x => x.scannings.length != 0);
                    return message;
                }

                // The only possible case left is when there is only one scanSession:

                let scanSession = request.scanSessions[0];
                let scan = scanSession.scannings[0];

                // Set this variable to TRUE when an outputBlock.value is changed from the server
                // This way the ACK response will communicate to the app the updated scan value.
                // This was the v3.12.0 way of executing remote components
                // @deprecated
                let outputBloksValueChanged = false;

                // Keyboard emulation
                for (let outputBlock of scan.outputBlocks) {

                    // Legacy code that skips the keyboard output of the components
                    // when the Skip Output option is enabled, except for some components
                    // wich in the older version of the app had a business-logic code embedded
                    // in the Keyboard Emulation
                    if (outputBlock.skipOutput &&
                        outputBlock.type != 'http' &&
                        outputBlock.type != 'run' &&
                        outputBlock.type != 'csv_lookup' &&
                        outputBlock.type != 'csv_update' &&
                        outputBlock.type != 'google_sheets') {
                        // For these components the continue; is called inside the switch below (< v3.12.0)
                        continue;
                    }

                    switch (outputBlock.type) {
                        case 'key': await this.keyTap(Number(outputBlock.keyId), outputBlock.modifierKeys.map(x => Number(x))); break;
                        case 'text': await this.typeString(outputBlock.value); break;
                        case 'variable': await this.typeString(outputBlock.value); break;
                        case 'date_time': await this.typeString(outputBlock.value); break;
                        case 'function': await this.typeString(outputBlock.value); break;
                        case 'barcode': await this.typeString(outputBlock.value); break;
                        case 'select_option': await this.typeString(outputBlock.value); break;
                        case 'image': {
                            if (outputBlock.outputImagePath) {
                                const buffer: Buffer =  Buffer.from(outputBlock.image.data);
                                fs.writeFile(outputBlock.outputImagePath, buffer, (err) => {
                                    if (err) { console.error(err); }
                                });
                            }
                            break;
                        }
                        case 'delay': {
                            if (isNumeric(outputBlock.value)) {
                                await new Promise(resolve => setTimeout(resolve, parseInt(outputBlock.value)))
                            }
                            break;
                        }
                        case 'woocommerce': {
                            if (!outputBlock.skipOutput) {
                                await this.typeString(outputBlock.value);
                            }
                            break;
                        }
                        case 'http': {
                            if (lt(this.devices[request.deviceId].version, new SemVer('3.12.0'))) {
                                /** @deprecated */
                                if (outputBlock.skipOutput) {
                                    axios.request({ url: outputBlock.value, method: outputBlock.method, timeout: outputBlock.timeout || Config.DEFAULT_COMPONENT_TIMEOUT });
                                } else {
                                    try {
                                        let response = (await axios.request({ url: outputBlock.value, method: outputBlock.method, timeout: outputBlock.timeout || Config.DEFAULT_COMPONENT_TIMEOUT })).data;
                                        if (typeof response == 'object') {
                                            response = JSON.stringify(response);
                                        }
                                        outputBlock.value = response;
                                        // message = request;
                                        await this.typeString(outputBlock.value)
                                    } catch (error) {
                                        // Do not change the value when the request fails to allow the Send again feature to work
                                        // if (error.code) {
                                        //      if (error.code == 'ECONNREFUSED') outputBlock.value = 'Connection refused';
                                        // }
                                    }
                                    outputBloksValueChanged = true;
                                }
                            } else {
                                // New versions, where the app is >= v3.12.0
                                if (!outputBlock.skipOutput) await this.typeString(outputBlock.value)
                                // When the skipOutput is true, we don't do anything.
                                // At this point the component has been already
                                // executed by the ACTION_REMOTE_COMPONENT request.
                                // The same applies to the RUN and CSV LOOKUP components.
                            }
                            break;
                        }
                        case 'run': {
                            if (lt(this.devices[request.deviceId].version, new SemVer('3.12.0'))) {
                                /** @deprecated */
                                if (outputBlock.skipOutput) {
                                    exec(outputBlock.value, { cwd: os.homedir(), timeout: outputBlock.timeout || Config.DEFAULT_COMPONENT_TIMEOUT })
                                } else {
                                    try {
                                        outputBlock.value = execSync(outputBlock.value, { cwd: os.homedir(), timeout: outputBlock.timeout || Config.DEFAULT_COMPONENT_TIMEOUT }).toString();
                                        await this.typeString(outputBlock.value)
                                    } catch (error) {
                                        // Do not change the value when the command fails to allow the Send again feature to work
                                        // if (error.code) {
                                        //     if (error.code == 'ETIMEDOUT') outputBlock.value = 'Timeout. Max allowed 10 seconds';
                                        //     if (error.code == 'ENOBUFS') outputBlock.value = 'Too much output. Max allowed 1024 bytes';
                                        // }
                                    }
                                    outputBloksValueChanged = true;
                                }
                            } else {
                                if (!outputBlock.skipOutput) await this.typeString(outputBlock.value)
                            }
                            break;
                        }
                        case 'csv_lookup': {
                            if (lt(this.devices[request.deviceId].version, new SemVer('3.12.0'))) {
                                /** @deprecated */
                                try {
                                    const content = fs.readFileSync(outputBlock.csvFile).toString().replace(/^\ufeff/, '')
                                    const records: any[] = parse(content, { columns: false, ltrim: true, rtrim: true, });
                                    const resultRow = records.find(x => x[outputBlock.searchColumn - 1] == outputBlock.value);
                                    outputBlock.value = resultRow[outputBlock.resultColumn - 1];
                                    await this.typeString(outputBlock.value)
                                } catch (error) {
                                    // If there is an error opening the file: do nothing
                                    if (error.code == 'ENOENT') continue;

                                    // If there is an error finding the desired columns
                                    outputBlock.value = outputBlock.notFoundValue;
                                }
                                outputBloksValueChanged = true;
                            } else {
                                if (!outputBlock.skipOutput) await this.typeString(outputBlock.value)
                            }
                            break;
                        }
                        case 'google_sheets':
                        case 'csv_update': {
                            if (!outputBlock.skipOutput) await this.typeString(outputBlock.value)
                            break;
                        }
                    } // end switch(outputBlock.type)
                } // end for

                // Append to csv
                if (this.settingsHandler.appendCSVEnabled && this.settingsHandler.csvPath) {

                    // Inject variables to the file path
                    let variables = {
                        barcodes: [],
                        barcode: null, // ''
                        number: null,
                        text: null,
                        /**
                         * We use the date of the Scan Session because it may be
                         * get synced later, and this may cause even days of
                         * difference => We use the most close date we've have
                         * compared to the actual scan date.
                         *
                         * We're not using the date from the Output template
                         * because there isn't a way to tell if a block
                         * contains a date since the TIMESTAMP component is of
                         * variable type. Solution => create a separate type
                         *
                         * Note that in the Output Template is handled
                         * differently (app side) by using the actual scan date
                         * instead.
                        */
                        timestamp: (scanSession.date * 1000),
                        // We assign a default value to date for backwards compatibility
                        // If the output template is created with a v3.17.0+ version
                        // the value of the date variable will be overwritten below.
                        date: new Date(scanSession.date).toISOString().slice(0, 10),
                        // The time variable is @deprecated. We keep it for backwards compatibility
                        time: new Date(scanSession.date).toLocaleTimeString().replace(/:/g, '-'),
                        date_time: null,
                        scan_session_name: scanSession.name,
                        device_name: null,
                        select_option: null,
                        run: null,
                        http: null,
                        woocommerce: null,
                        csv_lookup: null,
                        csv_update: null,
                        google_sheets: null,
                        javascript_function: null,
                    };
                    // Search if there is a corresponding Output component to assign to the NULL variables
                    let keys = Object.keys(variables);
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        if (variables[key] === null) { // Skips barcodes, timestamp, date, etc.
                            // Extract the variable value from the Output template
                            let value = 'Add a ' + key.toUpperCase() + ' component to the Output template';
                            let outputBlock = scanSession.scannings[0].outputBlocks.find(x => x.name.toLowerCase() == key);
                            if (typeof (outputBlock) != "undefined") {
                                value = outputBlock.value;
                            }
                            variables[key] = value;
                        } else if (key == 'barcodes') {
                            let barcodes = scanSession.scannings[0].outputBlocks.filter(x => x.name.toLowerCase() == 'barcode').map(x => x.value);
                            variables.barcodes = barcodes;
                        }
                    }
                    // Finally supplant the variables to the file path
                    let path = new Supplant().text(this.settingsHandler.csvPath, variables)

                    let newLineCharacter = this.settingsHandler.newLineCharacter.replace('CR', '\r').replace('LF', '\n');

                    // Generate header when needed
                    let header = null;
                    if (this.settingsHandler.enableHeaders) {
                        const headerAndData = ScanModel.ToCSV(
                            scanSession.scannings,
                            this.settingsHandler.exportOnlyText,
                            this.settingsHandler.enableQuotes,
                            this.settingsHandler.csvDelimiter,
                            newLineCharacter,
                            true,
                        );
                        const firstRow = fs.existsSync(path) && (fs.readFileSync(path, 'utf8').match(/(^.*)/) || [])[1] || '';

                        // Check if a non-empty and valid header has been generated from the data
                        if (headerAndData && headerAndData.length > 0 && headerAndData.split(newLineCharacter).length > 0) {

                            // Generate the final string that will be used as header only if it is not already in the file
                            const isHeaderPresent = firstRow && firstRow != '' && firstRow.includes(headerAndData[0]);
                            if (!isHeaderPresent) {
                                header = headerAndData.split(newLineCharacter)[0];
                            }
                        }
                    }

                    // The ToCSV() method includes the skipOutput logic
                    let rows = ScanModel.ToCSV(
                        scanSession.scannings, // Warning: contains only the last scan
                        this.settingsHandler.exportOnlyText,
                        this.settingsHandler.enableQuotes,
                        this.settingsHandler.csvDelimiter,
                        newLineCharacter,
                        false,
                    );
                    try {
                        if (rows.length != 0) {
                            fs.appendFileSync(path, rows + newLineCharacter);

                            // Prepend the header
                            if (header) {
                                const data = fs.readFileSync(path)
                                const fd = fs.openSync(path, 'w+')
                                const insert = Buffer.from(header + newLineCharacter)
                                fs.writeSync(fd, insert, 0, insert.length, 0)
                                fs.writeSync(fd, data, 0, data.length, insert.length)
                                fs.close(fd, (err) => {
                                    if (err) console.log('CSV Append Header Error:', err);
                                });
                            }
                        }
                    } catch (error) {
                        dialog.showMessageBox(this.uiHandler.mainWindow, {
                            type: 'error',
                            title: 'CSV Write error',
                            buttons: ['OK'],
                            message: "An error occurred while appending the scan to the specified CSV file. Please make sure that:\n\n\t1) the file is not open in other programs\n\t2) the server has the write permissions to the specified path\n\t3) the file name doesn't contain special characters"
                        });
                        console.log('CSV Write error:', error);
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
                    serverUUID: this.settingsHandler.getServerUUID(),
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
                this.devices[request.deviceId] = {
                    version: new SemVer(request.version),
                    name: request.deviceName,
                };
                break;
            }

            case requestModel.ACTION_REMOTE_COMPONENT: {
                // REMOTE_COMPONENT' job is to perform an action on the server,
                // and then write/overwrite the results in the request.outputBlock
                // object and send it back to the app.

                let request: requestModelRemoteComponent = message;
                let remoteComponentResponse = new responseModelRemoteComponentResponse();
                let responseOutputBlock = request.outputBlock;
                let errorMessage = null;

                switch (request.outputBlock.type) {
                    case 'woocommerce': {
                        try {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                            const wooCommerce = new WooCommerceRestApi({
                                url: request.outputBlock.url_woocommerce,
                                consumerKey: request.outputBlock.consumer_key,
                                consumerSecret: request.outputBlock.consumer_secret,
                                version: 'wc/v3',
                            });

                            let data = request.outputBlock.fields.reduce((params, field) => { params[field.key] = field.value; return params; }, {});
                            const endPoint = request.outputBlock.value.toLowerCase().indexOf('product') != -1 ? 'products' : 'orders';
                            switch (request.outputBlock.value) {
                                case 'createOrder':
                                case 'createProduct': {
                                    responseOutputBlock.value = JSON.stringify((await wooCommerce.post(endPoint, data)).data);
                                    break;
                                }
                                case 'retriveOrder':
                                case 'retriveProduct': {
                                    responseOutputBlock.value = JSON.stringify((await wooCommerce.get(`${endPoint}/${data['id'] || ''}`, data)).data);
                                    break;
                                }
                                case 'updateOrder':
                                case 'updateProduct': {
                                    // @ts-ignore
                                    const { id, ...paramsWithoutId } = data;
                                    responseOutputBlock.value = JSON.stringify((await wooCommerce.put(`${endPoint}/${data['id'] || ''}`, paramsWithoutId)).data);
                                    break;
                                }
                                case 'deleteOrder':
                                case 'deleteProduct': {
                                    // @ts-ignore
                                    const { id, ...paramsWithoutId } = data;
                                    responseOutputBlock.value = JSON.stringify((await wooCommerce.delete(`${endPoint}/${data['id'] || ''}`, paramsWithoutId)).data);
                                    break;
                                }
                            }
                        } catch (error) {
                            responseOutputBlock.value = "";
                            errorMessage = 'The WOOCOMMERCE ' + request.outputBlock.value.toUpperCase() + ' request failed. <br>';
                            errorMessage += '<br><b>Error</b>: ' + error.message;
                            if (error.response) {
                                errorMessage += '<br><b>Response Data</b>: ' + JSON.stringify(error.response.data);
                                errorMessage += '<br><b>Response Headers</b>: ' + JSON.stringify(error.response.headers);
                            }
                        } finally { }
                        break;
                    }
                    case 'http': {
                        try {
                            let params = JSON.parse(request.outputBlock.httpParams || '{}');
                            if (Object.keys(params).length === 0) params = null;
                            let haeders = JSON.parse(request.outputBlock.httpHeaders || '{}');
                            if (Object.keys(haeders).length === 0) haeders = null;

                            // Add OAuth header
                            const client = axios.create();
                            if (request.outputBlock.httpOAuthMethod && request.outputBlock.httpOAuthMethod != 'disabled') {
                                addOAuthInterceptor(client, {
                                    algorithm: request.outputBlock.httpOAuthMethod,
                                    key: request.outputBlock.httpOAuthConsumerKey,
                                    secret: request.outputBlock.httpOAuthConsumerSecret,
                                });
                            }

                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                            let response = (await client.request({
                                url: request.outputBlock.value,
                                data: request.outputBlock.httpData,
                                params: params,
                                headers: haeders,
                                method: request.outputBlock.method || request.outputBlock.httpMethod,
                                timeout: request.outputBlock.timeout || Config.DEFAULT_COMPONENT_TIMEOUT,
                                httpAgent: new http.Agent(),
                                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                            })).data;
                            if (typeof response == 'object') response = JSON.stringify(response);
                            responseOutputBlock.value = response;
                        } catch (error) {
                            responseOutputBlock.value = "";
                            errorMessage = 'The HTTP ' + request.outputBlock.httpMethod.toUpperCase() + ' request failed. <br><br>Error code: ' + error.code;
                        } finally { }
                        break;
                    }

                    case 'run': {
                        try {
                            responseOutputBlock.value = execSync(request.outputBlock.value, { cwd: os.homedir(), timeout: request.outputBlock.timeout || Config.DEFAULT_COMPONENT_TIMEOUT }).toString();
                        } catch (error) {
                            responseOutputBlock.value = "";
                            let output = error.output.toString().substr(2);
                            errorMessage = 'The RUN command failed.<br>';
                            if (output.length) {
                                responseOutputBlock.value = output;
                                errorMessage += '<br>Output: ' + output;
                            } else {
                                errorMessage += '<br>Output: null';
                            }
                            errorMessage += '<br>Exit status: ' + error.status;
                        }
                        break;
                    }

                    case 'csv_lookup': {

                        // Try to open the file
                        let fileContent: string;
                        try {
                            fileContent = fs.readFileSync(request.outputBlock.csvFile).toString().replace(/^\ufeff/, '');
                        } catch (error) {
                            errorMessage = 'The CSV_LOOKUP component failed to access ' + request.outputBlock.csvFile + '<br>Make you sure the path is correct and that the server has the read permissions.<br><br>Error code: ' + error.code; // ENOENT
                            break;
                        }

                        // Try to find the columns
                        try {
                            const records: any[] = parse(fileContent, { columns: false, ltrim: true, rtrim: true, delimiter: request.outputBlock.delimiter });
                            const resultRow = records.find(x => x[request.outputBlock.searchColumn - 1] == request.outputBlock.value);
                            responseOutputBlock.value = resultRow[request.outputBlock.resultColumn - 1];
                        } catch (error) {
                            responseOutputBlock.value = request.outputBlock.notFoundValue;
                            break;
                        }

                        break;
                    }

                    case 'google_sheets': {
                        let result = null;

                        if (request.outputBlock.action === 'get') {
                            result = await this.gsheet.get(
                                request.outputBlock.sheetId,
                                request.outputBlock.workSheetIndex,
                                request.outputBlock.searchColumnA1,
                                request.outputBlock.value,
                                request.outputBlock.columnToReadA1,
                                request.outputBlock.rowToUpdate,
                            );
                        } else if (request.outputBlock.action === 'update') {
                            result = await this.gsheet.update(
                                request.outputBlock.sheetId,
                                request.outputBlock.workSheetIndex,
                                request.outputBlock.searchColumnA1,
                                request.outputBlock.value,
                                request.outputBlock.columnToUpdateA1,
                                request.outputBlock.newValue,
                                request.outputBlock.rowToUpdate,
                                request.outputBlock.appendIfNotFound,
                            );
                        } else if (request.outputBlock.action === 'append') {
                            result = await this.gsheet.append(
                                request.outputBlock.sheetId,
                                request.outputBlock.workSheetIndex,
                                request.outputBlock.columnsToAppend,
                            );
                        }

                        if (result !== null) {
                            responseOutputBlock.value = result;
                        } else {
                            responseOutputBlock.value = request.outputBlock.notFoundValue;
                        }
                        break;
                    }

                    case 'csv_update': {

                        // Try to open the file
                        let fileContent: string;
                        try {
                            fileContent = fs.readFileSync(request.outputBlock.csvFile).toString().replace(/^\ufeff/, '');
                        } catch (error) {
                            errorMessage = 'The CSV_UPDATE component failed to access ' + request.outputBlock.csvFile + '<br>Make you sure the path is correct and that the server has the read permissions.<br><br>Error code: ' + error.code; // ENOENT
                            break;
                        }

                        // Try to find the columns
                        try {
                            const records: any[] = parse(fileContent, { columns: false, ltrim: true, rtrim: true, delimiter: request.outputBlock.delimiter });
                            let output = request.outputBlock.notFoundValue;

                            // Replace the values
                            let result;
                            switch (request.outputBlock.rowToUpdate) {
                                case 'all':
                                    result = records.map(row => {
                                        if (row[request.outputBlock.searchColumn - 1] == request.outputBlock.value) {
                                            row[request.outputBlock.columnToUpdate - 1] = request.outputBlock.newValue
                                            output = request.outputBlock.newValue;
                                        }
                                        return row;
                                    });
                                    break;

                                case 'first':
                                    const firstIndex = records.findIndex(x => x[request.outputBlock.searchColumn - 1] == request.outputBlock.value);
                                    console.log('First index: ', firstIndex)
                                    if (firstIndex != -1) {
                                        console.log('row: ', records[firstIndex])
                                        records[firstIndex][request.outputBlock.columnToUpdate - 1] = request.outputBlock.newValue
                                        output = request.outputBlock.newValue;
                                    }
                                    result = records;
                                    break;

                                case 'last':
                                    const lastIndex = ScansHandler.findLastIndex(records, x => x[request.outputBlock.searchColumn - 1] == request.outputBlock.value);
                                    if (lastIndex != -1) {
                                        records[lastIndex][request.outputBlock.columnToUpdate - 1] = request.outputBlock.newValue
                                        output = request.outputBlock.newValue;
                                    }
                                    result = records;
                                    break;
                            }

                            // Write the file synchronously
                            await new Promise<void>((resolve) => {
                                stringify(result, { delimiter: request.outputBlock.delimiter }, (err: Error | undefined, output: string) => {
                                    fs.writeFileSync(request.outputBlock.csvFile, output);
                                    resolve();
                                })
                            });
                            responseOutputBlock.value = output;
                        } catch (error) {
                            responseOutputBlock.value = request.outputBlock.notFoundValue;
                            break;
                        }

                        break;
                    }
                } // end switch(outputBlock.type)

                remoteComponentResponse.fromObject({
                    id: request.id,
                    errorMessage: errorMessage,
                    outputBlock: responseOutputBlock,
                });
                ws.send(JSON.stringify(remoteComponentResponse));
                break;
            } // end ACTION_REMOTE_COMPONENT
        } // end switch(message.action)
        return message;
    }

    async keyTap(key: number, modifiers: number[]) {
        if (!this.settingsHandler.enableRealtimeStrokes || !key) {
            return;
        }
        await keyboard.pressKey(...modifiers, key);
        await keyboard.releaseKey(...modifiers, key);
    }

    async typeString(string) {
        if (!this.settingsHandler.enableRealtimeStrokes || !string) {
            return;
        }

        if (this.settingsHandler.typeMethod == 'keyboard') {
            await keyboard.type(string);
        } else {
            clipboard.writeText(string);
            if (process.platform === "darwin") {
                await keyboard.pressKey(Key.LeftSuper, Key.V);
                await keyboard.releaseKey(Key.LeftSuper, Key.V);
            } else {
                await keyboard.pressKey(Key.LeftControl, Key.V);
                await keyboard.releaseKey(Key.LeftControl, Key.V);
            }
        }
    }

    onWsClose(ws: WebSocket) {
        throw new Error("Method not implemented.");
    }

    onWsError(ws: WebSocket, err: Error) {
        throw new Error("Method not implemented.");
    }

    setIpcClient(ipcClient) {
        this.ipcClient = ipcClient;
    }

    /**
     * Returns the index of the last element in the array where predicate is true, and -1
     * otherwise.
     * @param array The source array to search in
     * @param predicate find calls predicate once for each element of the array, in descending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
     *
     * https://stackoverflow.com/questions/40929260/find-last-index-of-element-inside-array-by-certain-condition
     */
    public static findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
        let l = array.length;
        while (l--) {
            if (predicate(array[l], l, array))
                return l;
        }
        return -1;
    }
}

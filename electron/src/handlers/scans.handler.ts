import axios from 'axios';
import addOAuthInterceptor from 'axios-oauth-1.0a';
import { exec, execSync } from 'child_process';
import * as parse from 'csv-parse/lib/sync';
import * as stringify from 'csv-stringify';
import { clipboard, dialog, shell } from 'electron';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import * as robotjs from 'robotjs';
import { isNumeric } from 'rxjs/util/isNumeric';
import { lt, SemVer } from 'semver';
import * as Supplant from 'supplant';
import * as WebSocket from 'ws';
import { requestModel, requestModelHelo, requestModelOnSmartphoneCharge, requestModelPutScanSessions, requestModelRemoteComponent } from '../../../ionic/src/models/request.model';
import { responseModelPutScanAck, responseModelRemoteComponentResponse } from '../../../ionic/src/models/response.model';
import { ScanModel } from '../../../ionic/src/models/scan.model';
import { Config } from '../config';
import { Handler } from '../models/handler.model';
import { SettingsHandler } from './settings.handler';
import { UiHandler } from './ui.handler';
import * as xlsx from 'xlsx';

export class ScansHandler implements Handler {
    private static instance: ScansHandler;
    private devices = {};
    private ipcClient;

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
                let outputBloksValueChanged = false;

                // keyboard emulation
                for (let outputBlock of scan.outputBlocks) {
                    if (outputBlock.skipOutput && outputBlock.type != 'http' && outputBlock.type != 'run'
                        && outputBlock.type != 'csv_lookup' && outputBlock.type != 'csv_update') {
                        // for these components the continue; is called inside the switch below (< v3.12.0)
                        continue;
                    }

                    switch (outputBlock.type) {
                        case 'key': this.keyTap(outputBlock.value, outputBlock.modifiers); break;
                        case 'text': this.typeString(outputBlock.value); break;
                        case 'variable': this.typeString(outputBlock.value); break;
                        case 'date_time': this.typeString(outputBlock.value); break;
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
                                        this.typeString(outputBlock.value)
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
                                if (!outputBlock.skipOutput) this.typeString(outputBlock.value)
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
                            } else {
                                if (!outputBlock.skipOutput) this.typeString(outputBlock.value)
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
                                    this.typeString(outputBlock.value)
                                } catch (error) {
                                    // If there is an error opening the file: do nothing
                                    if (error.code == 'ENOENT') continue;

                                    // If there is an error finding the desired columns
                                    outputBlock.value = outputBlock.notFoundValue;
                                }
                                outputBloksValueChanged = true;
                            } else {
                                if (!outputBlock.skipOutput) this.typeString(outputBlock.value)
                            }
                            break;
                        }
                        case 'csv_update': {
                            if (!outputBlock.skipOutput) this.typeString(outputBlock.value)
                            break;
                        }
                    } // end switch(outputBlock.type)
                } // end for

                // Append to csv
                if (this.settingsHandler.appendCSVEnabled && this.settingsHandler.csvPath) {
                    let newLineCharacter = this.settingsHandler.newLineCharacter.replace('CR', '\r').replace('LF', '\n');
                    // The ToCSV() method includes the skipOutput logic
                    let rows = ScanModel.ToCSV(
                        scanSession.scannings, // Warning: contains only the last scan
                        this.settingsHandler.exportOnlyText,
                        this.settingsHandler.enableQuotes,
                        this.settingsHandler.csvDelimiter,
                        newLineCharacter
                    );

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
                        csv_lookup: null,
                        csv_update: null,
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

                    try {
                        if (rows.length != 0) {
                            fs.appendFileSync(path, rows + newLineCharacter);
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

                //Append to xlsx
                if (this.settingsHandler.appendXLSXEnabled && this.settingsHandler.xlsxPath) {
                    let rows = ScanModel.ToXLSX(
                        scanSession.scannings, // Warning: contains only the last scan
                        this.settingsHandler.exportOnlyTextXlsx
                    );

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
                        csv_lookup: null,
                        csv_update: null,
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
                    let path = new Supplant().text(this.settingsHandler.xlsxPath, variables)

                    try {
                        if (ws) {
                            const wb = xlsx.utils.book_new();
                            xlsx.utils.book_append_sheet(wb, ws, path);
                        }
                    } catch (error) {
                        dialog.showMessageBox(this.uiHandler.mainWindow, {
                            type: 'error',
                            title: 'XLSX Write error',
                            buttons: ['OK'],
                            message: "An error occurred while appending the scan to the specified XLSX file. Please make sure that:\n\n\t1) the file is not open in other programs\n\t2) the server has the write permissions to the specified path\n\t3) the file name doesn't contain special characters"
                        });
                        console.log('XLSX Write error:', error);
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
                let request: requestModelRemoteComponent = message;
                let remoteComponentResponse = new responseModelRemoteComponentResponse();
                let responseOutputBlock = request.outputBlock;
                let errorMessage = null;

                // Overrides the necessary values of the request.outputBlock
                // object and sends it back to the app.s
                switch (request.outputBlock.type) {
                    case 'http': {
                        try {
                            let params = JSON.parse(request.outputBlock.httpParams || '{}');
                            if (params == {}) params = null;
                            let haeders = JSON.parse(request.outputBlock.httpHeaders || '{}');
                            if (haeders == {}) haeders = null;

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
                                httpAgent: new https.Agent({ rejectUnauthorized: false }),
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
            if (process.platform === 'linux') {
                ScansHandler.TypeStringLinuxFix(string);
            } else {
                robotjs.typeString(string);
            }
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

    setIpcClient(ipcClient) {
        this.ipcClient = ipcClient;
    }

    /**
     * TODO: stop using this function after updating robotjs, related to: https://github.com/fttx/barcode-to-pc-server/issues/219
     * Fix source: https://github.com/octalmage/robotjs/issues/285#issuecomment-463116360
     */
    private static TypeStringLinuxFix(str: string) {
        const MATCH_REGEX = /[~!@#\$%\^&*()_+{}|:"<>?]/;
        // minimize delay between robotjs keyboard calls
        robotjs.setKeyboardDelay(1);
        while (str) {
            let match = str.match(MATCH_REGEX);
            if (match) {
                robotjs.typeString(str.substr(0, match['index']));
                robotjs.keyTap(match[0], ['shift']);
                str = str.substr(match['index'] + 1);
            } else {
                robotjs.typeString(str);
                str = null;
            }
        }
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

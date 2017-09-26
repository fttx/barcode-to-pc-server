import { ScanSessionModel } from "./scan-session.model";
import { ScanModel } from "./scan.model";

export abstract class requestModel {
    // protected _action: string;
    // get action() {
    //     return this._action;
    // }

    readonly action: string;
    // i can't put all the fromObject(s) here as static methods because the overload won't work
    // it is because when typescript gets compiled to js the obj type is lost and the methods result all with the same signature
    public abstract fromObject(obj: any): requestModel;
    public static readonly ACTION_HELO = 'helo';
    public static readonly ACTION_SET_SCAN_SESSIONS = 'setScanSessions';
    public static readonly ACTION_PUT_SCAN_SESSION = 'putScanSession';
    public static readonly ACTION_PUT_SCAN = 'putScan';
    public static readonly ACTION_DELETE_SCAN_SESSION = 'deleteScanSession';
    public static readonly ACTION_DELETE_SCAN = 'deleteScan';
}

export class requestModelHelo extends requestModel {
    action = 'helo';
    clientName: string;

    public fromObject(obj: ({ clientName: string })) {
        this.clientName = obj.clientName;
        return this;
    }
}

export class requestModelSetScanSessions extends requestModel {
    action = 'setScanSessions';
    scanSessions: ScanSessionModel[];
    sendKeystrokes: boolean;

    public fromObject(obj: ({ scanSessions: ScanSessionModel[], sendKeystrokes: boolean })) {
        this.scanSessions = obj.scanSessions;
        this.sendKeystrokes = obj.sendKeystrokes;
        return this;
    }
}

export class requestModelPutScanSession extends requestModel {
    action = 'putScanSession';
    scanSessions: ScanSessionModel;
    sendKeystrokes: boolean;

    public fromObject(obj: ({ scanSession: ScanSessionModel })) {
        this.scanSessions = obj.scanSession;
        return this;
    }
}

export class requestModelPutScan extends requestModel {
    action = 'putScan';
    scan: ScanModel;
    scanSessionId: number;
    sendKeystrokes: boolean;

    public fromObject(obj: ({ scan: ScanModel, scanSessionId: number, sendKeystrokes: boolean })) {
        this.scan = obj.scan;
        this.scanSessionId = obj.scanSessionId;
        this.sendKeystrokes = obj.sendKeystrokes;
        return this;
    }
}

export class requestModelDeleteScanSession extends requestModel {
    action = 'deleteScanSession';
    scanSessionId: number;

    public fromObject(obj: ({ scanSessionId: number })) {
        this.scanSessionId = obj.scanSessionId;
        return this;
    }
}

export class requestModelDeleteScan extends requestModel {
    action = 'deleteScan';
    scan: ScanModel;
    scanSessionId: number

    public fromObject(obj: ({ scan: ScanModel, scanSessionId: number })) {
        this.scan = obj.scan;
        this.scanSessionId = obj.scanSessionId;
        return this;
    }
}

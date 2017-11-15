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
    public static readonly ACTION_PING = 'ping';
    public static readonly ACTION_HELO = 'helo';
    public static readonly ACTION_PUT_SCAN_SESSIONS = 'putScanSessions';
    public static readonly ACTION_PUT_SCAN_SESSION = 'putScanSession';
    public static readonly ACTION_PUT_SCAN = 'putScan';
    public static readonly ACTION_DELETE_SCAN_SESSION = 'deleteScanSession';
    public static readonly ACTION_DELETE_SCAN = 'deleteScan';
    public static readonly ACTION_UPDATE_SCAN_SESSION = 'updateScanSession';
}

export class requestModelPing extends requestModel {
    action = 'ping';

    public fromObject(obj: ({})) {
        return this;
    }
}

export class requestModelHelo extends requestModel {
    action = 'helo';
    deviceName: string;
    deviceId: string;
    lastScanDate: number;

    public fromObject(obj: ({ deviceName: string, deviceId: string, lastScanDate: number })) {
        this.deviceName = obj.deviceName;
        this.deviceId = obj.deviceId;
        this.lastScanDate = obj.lastScanDate;
        return this;
    }
}

export class requestModelPutScanSessions extends requestModel {
    action = 'putScanSessions';
    scanSessions: ScanSessionModel[];
    sendKeystrokes: boolean;
    lastScanDate: number;
    deviceId: string

    public fromObject(obj: ({ scanSessions: ScanSessionModel[], sendKeystrokes: boolean, lastScanDate: number, deviceId: string, })) {
        this.scanSessions = obj.scanSessions;
        this.sendKeystrokes = obj.sendKeystrokes;
        this.lastScanDate = obj.lastScanDate;
        this.deviceId = obj.deviceId;
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
    lastScanDate: number;
    newScanDate: number;
    deviceId: string

    public fromObject(obj: ({ scan: ScanModel, scanSessionId: number, sendKeystrokes: boolean, lastScanDate: number, newScanDate: number, deviceId: string, })) {
        this.scan = obj.scan;
        this.scanSessionId = obj.scanSessionId;
        this.sendKeystrokes = obj.sendKeystrokes;
        this.lastScanDate = obj.lastScanDate;
        this.newScanDate = obj.newScanDate;
        this.deviceId = obj.deviceId;
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

export class requestModelUpdateScanSession extends requestModel {
    action = 'updateScanSession';
    scanSessionId: number;
    scanSessionName: string;
    scanSessionDate: Date;

    public fromObject(obj: ({ scanSessionId: number, scanSessionName: string, scanSessionDate: Date })) {
        this.scanSessionId = obj.scanSessionId;
        this.scanSessionName = obj.scanSessionName;
        this.scanSessionDate = obj.scanSessionDate;
        return this;
    }
}

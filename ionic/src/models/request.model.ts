import { ScanSessionModel } from './scan-session.model';
import { ScanModel } from './scan.model';

export abstract class requestModel {
    // protected _action: string;
    // get action() {
    //     return this._action;
    // }

    readonly action: string;
    // i can't put all the fromObject(s) here as static methods because the overload won't work
    // it is because when typescript gets compiled to js the obj type is lost and the methods result all with the same signature
    public abstract fromObject(obj: any): requestModel;
    public static readonly ACTION_GET_VERSION = 'getVersion';
    public static readonly ACTION_PING = 'ping';
    public static readonly ACTION_HELO = 'helo';
    public static readonly ACTION_PUT_SCAN_SESSIONS = 'putScanSessions';
    public static readonly ACTION_DELETE_SCAN_SESSION = 'deleteScanSession';
    public static readonly ACTION_DELETE_SCAN = 'deleteScan';
    public static readonly ACTION_UPDATE_SCAN_SESSION = 'updateScanSession';
    public static readonly ACTION_CLEAR_SCAN_SESSIONS = 'clearScanSessions';
    public static readonly ACTION_ON_SMARTPHONE_CHARGE = 'action_on_smartphone_charge';
    public static readonly UNDO_INFINITE_LOOP = 'undo_infinite_loop';
}

/**
 * @deprecated
 */
export class requestModelGetVersion extends requestModel {
    action = requestModel.ACTION_GET_VERSION;

    public fromObject(obj: ({})) {
        return this;
    }
}

export class requestModelPing extends requestModel {
    action = requestModel.ACTION_PING;

    public fromObject(obj: ({})) {
        return this;
    }
}

export class requestModelHelo extends requestModel {
    action = requestModel.ACTION_HELO;
    deviceName: string;
    deviceId: string;
    version: string;

    public fromObject(obj: ({ version: string, deviceName: string, deviceId: string, })) {
        this.version = obj.version;
        this.deviceName = obj.deviceName;
        this.deviceId = obj.deviceId;
        return this;
    }
}

export class requestModelPutScanSessions extends requestModel {
    action = requestModel.ACTION_PUT_SCAN_SESSIONS;
    scanSessions: ScanSessionModel[];
    sendKeystrokes: boolean;
    deviceId: string

    public fromObject(obj: ({ scanSessions: ScanSessionModel[], sendKeystrokes: boolean, deviceId: string, })) {
        this.scanSessions = obj.scanSessions;
        this.sendKeystrokes = obj.sendKeystrokes;
        this.deviceId = obj.deviceId;
        return this;
    }
}

export class requestModelDeleteScanSessions extends requestModel {
    action = requestModel.ACTION_DELETE_SCAN_SESSION;
    scanSessionIds: number[];

    public fromObject(obj: ({ scanSessionIds: number[] })) {
        this.scanSessionIds = obj.scanSessionIds;
        return this;
    }
}

export class requestModelDeleteScan extends requestModel {
    action = requestModel.ACTION_DELETE_SCAN;
    scan: ScanModel;
    scanSessionId: number

    public fromObject(obj: ({ scan: ScanModel, scanSessionId: number })) {
        this.scan = obj.scan;
        this.scanSessionId = obj.scanSessionId;
        return this;
    }
}

export class requestModelUpdateScanSession extends requestModel {
    action = requestModel.ACTION_UPDATE_SCAN_SESSION;
    scanSessionId: number;
    scanSessionName: string;
    scanSessionDate: number;

    public fromObject(obj: ({ scanSessionId: number, scanSessionName: string, scanSessionDate: number })) {
        this.scanSessionId = obj.scanSessionId;
        this.scanSessionName = obj.scanSessionName;
        this.scanSessionDate = obj.scanSessionDate;
        return this;
    }
}

export class requestModelClearScanSessions extends requestModel {
    action = requestModel.ACTION_CLEAR_SCAN_SESSIONS;
    public fromObject(obj: ({})) {
        return this;
    }
}

export class requestModelOnSmartphoneCharge extends requestModel {
    action = requestModel.ACTION_ON_SMARTPHONE_CHARGE;
    public fromObject(obj: ({})) {
        return this;
    }
}

export class requestModelUndoInfiniteLoop extends requestModel {
    action = requestModel.UNDO_INFINITE_LOOP;
    count: number;

    public fromObject(obj: ({ count: number })) {
        this.count = obj.count;
        return this;
    }
}

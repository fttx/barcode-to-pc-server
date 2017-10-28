export abstract class responseModel {
    readonly action: string;
    public abstract fromObject(obj: any): responseModel;

    public static readonly ACTION_HELO = 'helo';
    public static readonly ACTION_PONG = 'pong';
    public static readonly ACTION_PUT_SCAN_ACK = 'putScanAck';
    public static readonly ACTION_POPUP = 'action_popup';

}

export class responseModelHelo {
    action: 'helo';
    version: string;

    public fromObject(obj: ({ version: string })) {
        this.version = obj.version;
        return this;
    }
}


export class responseModelPong extends responseModel {
    action = 'pong';

    public fromObject(obj: ({})) {
        return this;
    }
}

export class responseModelPutScanAck extends responseModel {
    action = 'putScanAck';
    scanSessionId: number;
    scanId: number;

    public fromObject(obj: ({ scanSessionId: number, scanId: number })) {
        this.scanSessionId = obj.scanSessionId;
        this.scanId = obj.scanId;
        return this;
    }
}

export class responseModelPopup extends responseModel {
    action = 'action_popup';
    title: string;
    message: string;

    public fromObject(obj: ({ title: string, message: string })) {
        this.title = obj.title;
        this.message = obj.message;
        return this;
    }
}
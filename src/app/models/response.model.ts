export abstract class responseModel {
    readonly action: string;
    public abstract fromObject(obj: any): responseModel;

    public static readonly ACTION_HELO = 'helo';    
    public static readonly ACTION_PONG = 'pong';
    
}

export class responseModelHelo {
    action: 'helo';
    version: string;

    public fromObject(obj: ({version: string})) {
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
export abstract class responseModel {
    readonly action: string;
    public abstract fromObject(obj: any): responseModel;
    public static readonly ACTION_HELO = 'helo';
}

export class responseModelHelo extends responseModel {
    action = 'helo';
    version: string;

    public fromObject(obj: ({ version: string })) {
        this.version = obj.version;
        return this;
    }
}
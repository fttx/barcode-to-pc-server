import { OutputBlockModel } from "./output-block.model";
import { OutputProfileModel } from "./output-profile.model";

/**
 * When editing this file rember to reflect the same changes to
 * response.model.ts present on the server side.
 */
export abstract class responseModel {
    readonly action: string;
    public abstract fromObject(obj: any): responseModel;

    public static readonly ACTION_GET_VERSION = 'getVersion';
    public static readonly ACTION_HELO = 'helo';
    public static readonly ACTION_PONG = 'pong';
    public static readonly ACTION_PUT_SCAN_ACK = 'putScanAck';
    public static readonly ACTION_POPUP = 'action_popup';
    public static readonly ACTION_ENABLE_QUANTITY = 'enableQuantity';
    public static readonly ACTION_UPDATE_SETTINGS = 'update_output_profiles';
    public static readonly ACTION_REQUEST_SCAN_SESSION_UPDATE = 'requestScanSessionUpdate';
    public static readonly ACTION_KICK = 'kick';
    public static readonly ACTION_REMOTE_COMPONENT_RESPONSE = 'remoteComponentResponse';
    public static readonly EVENT_ON_SMARTPHONE_CHARGE = 'on_smartphone_charge';
    public static readonly ACTION_SHOW_EMAIL_INCENTIVE_ALERT = 'action_show_email_incentive_alert';
    public static readonly ACTION_UNKICK = 'unkick';
}

/**
 * @deprecated
 */
export class responseModelGetVersion extends responseModel {
    action = responseModel.ACTION_GET_VERSION;
    version: string;

    public fromObject(obj: ({ version: string })) {
        this.version = obj.version;
        return this;
    }
}

export class responseModelHelo extends responseModel {
    action = responseModel.ACTION_HELO;
    version: string;
    outputProfiles: OutputProfileModel[];
    events: string[];
    serverUUID: string;
    savedGeoLocations: { name: string, latitude: number, longitude: number }[];
    kicked: boolean;

    /**
     * @deprecated Use OutputProfiles instead
     */
    quantityEnabled: boolean;

    public fromObject(obj: ({ version: string, outputProfiles: OutputProfileModel[], quantityEnabled: boolean, events: string[], serverUUID: string, savedGeoLocations: { name: string, latitude: number, longitude: number }[] })) {
        this.outputProfiles = obj.outputProfiles;
        if (obj.events) {
            this.events = obj.events;
        } else {
            this.events = [];
        }
        this.savedGeoLocations = obj.savedGeoLocations || [];
        this.version = obj.version;
        this.outputProfiles = obj.outputProfiles;
        this.quantityEnabled = obj.quantityEnabled;
        this.serverUUID = obj.serverUUID;
        return this;
    }
}

export class responseModelPong extends responseModel {
    action = responseModel.ACTION_PONG;

    public fromObject(obj: ({})) {
        return this;
    }
}

export class responseModelPutScanAck extends responseModel {
    action = responseModel.ACTION_PUT_SCAN_ACK;
    scanSessionId: number;
    scanId: number;
    outputBlocks: OutputBlockModel[];
    serverUUID: string;

    public fromObject(obj: ({ scanSessionId: number, scanId: number, outputBlocks: OutputBlockModel[], serverUUID: string })) {
        this.scanSessionId = obj.scanSessionId;
        this.scanId = obj.scanId;
        this.outputBlocks = obj.outputBlocks;
        this.serverUUID = obj.serverUUID;
        return this;
    }
}

export class responseModelPopup extends responseModel {
    action = responseModel.ACTION_POPUP;
    title: string;
    message: string;

    public fromObject(obj: ({ title: string, message: string })) {
        this.title = obj.title;
        this.message = obj.message;
        return this;
    }
}

export class responseModelShowEmailIncentiveAlert extends responseModel {
    action = responseModel.ACTION_SHOW_EMAIL_INCENTIVE_ALERT;

    public fromObject(obj: ({})) {
        return this;
    }
}

/**
 * @deprecated For backwards compatibility only, use OutputProfiles instead
 */
export class responseModelEnableQuantity extends responseModel {
    action = responseModel.ACTION_ENABLE_QUANTITY;
    enable: boolean;

    public fromObject(obj: ({ enable: boolean })) {
        this.enable = obj.enable;
        return this;
    }
}

export class responseModelUpdateSettings extends responseModel {
    action = responseModel.ACTION_UPDATE_SETTINGS;

    // Warning: these same settings are also communicated in the HELO response
    outputProfiles: OutputProfileModel[];
    events: string[];
    savedGeoLocations: { name: string, latitude: number, longitude: number }[];

    public fromObject(obj: ({ outputProfiles: OutputProfileModel[], events: string[], savedGeoLocations: { name: string, latitude: number, longitude: number }[] })) {
        this.outputProfiles = obj.outputProfiles;
        if (obj.events) {
            this.events = obj.events;
        } else {
            this.events = [];
        }
        this.savedGeoLocations = obj.savedGeoLocations || [];
        return this;
    }
}

export class responseModelKick extends responseModel {
    action = responseModel.ACTION_KICK;
    message: string = '';

    public fromObject(obj: ({ message: string })) {
        this.message = obj.message;
        return this;
    }
}

export class responseModelRemoteComponentResponse extends responseModel {
    action = responseModel.ACTION_REMOTE_COMPONENT_RESPONSE;
    id: number;
    errorMessage: string;
    outputBlock: OutputBlockModel;

    public fromObject(obj: ({ id: number, errorMessage: string, outputBlock: OutputBlockModel, })) {
        this.id = obj.id;
        this.errorMessage = obj.errorMessage;
        this.outputBlock = obj.outputBlock;
        return this;
    }
}

export class responseModelUnkick {
    public action = responseModel.ACTION_UNKICK;

    fromObject(): this {
        return this;
    }
}

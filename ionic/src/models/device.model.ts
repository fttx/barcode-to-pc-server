import { SemVer } from "semver";

export class DeviceModel {
    name: string;
    // ip: string;
    deviceId: string;
    version: SemVer;
    connected: boolean;
    kicked: boolean = false;

    constructor(deviceId: string, name: string = '', version: SemVer, connected: boolean = false) {
        this.deviceId = deviceId;
        this.name = name;
        // this.ip = ip;
        this.connected = connected;
    }

    equals(device: DeviceModel) {
        return this.deviceId == device.deviceId;
    }
}

export class DeviceModel {
    name: string;
    // ip: string;
    deviceId: string;
    connected: boolean;

    constructor(deviceId: string, name: string = '', connected: boolean = false) {
        this.deviceId = deviceId;
        this.name = name;
        // this.ip = ip;
        this.connected = connected;
    }

    equals(device: DeviceModel) {
        return this.deviceId == device.deviceId;
    }
}
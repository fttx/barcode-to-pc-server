import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { DeviceModel } from '../../models/device.model';
import { requestModel, requestModelHelo } from '../../models/request.model';
import { ElectronProvider } from '../electron/electron';
import { responseModelKick } from '../../models/response.model';
import { SemVer } from 'semver';

@Injectable()
export class DevicesProvider {

  public devices: DeviceModel[] = [];
  private _onConnectedDevicesListChange: ReplaySubject<DeviceModel[]> = new ReplaySubject<DeviceModel[]>();
  public onConnectedDevicesListChange = () => this._onConnectedDevicesListChange;

  private _onDeviceConnect: ReplaySubject<DeviceModel> = new ReplaySubject<DeviceModel>();
  public onDeviceConnect = () => this._onDeviceConnect;

  private _onDeviceDisconnect: ReplaySubject<DeviceModel> = new ReplaySubject<DeviceModel>();
  public onDeviceDisconnect = () => this._onDeviceDisconnect;

  constructor(
    private ngZone: NgZone,
    private electronProvider: ElectronProvider,
  ) {
    if (ElectronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        this.ngZone.run(() => {
          this.addDevice(new DeviceModel(request.deviceId, request.deviceName, new SemVer(request.version), true));
        });
      });

      this.electronProvider.ipcRenderer.on('wsError', (e, data: { deviceId: string }) => {
        this.ngZone.run(() => {
          this.removeDevice(data.deviceId);
        });
      });

      this.electronProvider.ipcRenderer.on('wsClose', (e, data: { deviceId: string, err }) => {
        this.ngZone.run(() => {
          this.removeDevice(data.deviceId);
        });
      });
    }
  }

  kickDevice(device: DeviceModel, message = '') {
    device.kicked = true;
    let data = {
      deviceId: device.deviceId,
      response: new responseModelKick().fromObject({
        message: message
      })
    }
    this.electronProvider.ipcRenderer.send('kick', data);
  }

  kickAllDevices(message = '') {
    this.devices.forEach(device => this.kickDevice(device, message));
  }

  private addDevice(device: DeviceModel) {
    if (this.devices.findIndex(x => x.equals(device)) == -1) {
      this.devices.push(device);
      this._onDeviceConnect.next(device);
    }
    this._onConnectedDevicesListChange.next(this.devices);
  }

  private removeDevice(deviceId: string) {
    let index = this.devices.findIndex(x => x.deviceId == deviceId);
    if (index != -1) {
      this._onDeviceDisconnect.next(this.devices[index]);
      this.devices.splice(index, 1);
    }
    this._onConnectedDevicesListChange.next(this.devices);
  }
}

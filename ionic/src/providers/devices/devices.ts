import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

import { DeviceModel } from '../../models/device.model';
import { requestModel, requestModelHelo } from '../../models/request.model';
import { ElectronProvider } from '../electron/electron';
import { StorageProvider } from '../storage/storage';
import { responseModelKick } from '../../models/response.model';

/*
  Generated class for the DevicesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DevicesProvider {
  public connectedDevices: DeviceModel[] = [];
  private _onConnectedDevicesListChange: Subject<DeviceModel[]> = new Subject<DeviceModel[]>();
  public onConnectedDevicesListChange = () => this._onConnectedDevicesListChange;

  constructor(
    private ngZone: NgZone,
    private storageProvider: StorageProvider,
    private electronProvider: ElectronProvider,
  ) {
    if (this.electronProvider.isElectron()) {
      this.electronProvider.ipcRenderer.on(requestModel.ACTION_HELO, (e, request: requestModelHelo) => {
        this.ngZone.run(() => {
          this.addDevice(new DeviceModel(request.deviceId, request.deviceName, true));
        });
      });

      this.electronProvider.ipcRenderer.on('wsError', (e, data: { deviceId: string }) => {
        this.ngZone.run(() => {
          this.removeDevice(new DeviceModel(data.deviceId))
        });
      });

      this.electronProvider.ipcRenderer.on('wsClose', (e, data: { deviceId: string, err }) => {
        this.ngZone.run(() => {
          this.removeDevice(new DeviceModel(data.deviceId))
        });
      });
    }
  }

  public kickDevice(device: DeviceModel, message = '') {
    device.kicked = true;
    let data = {
      deviceId: device.deviceId,
      response: new responseModelKick().fromObject({
        message: message
      })
    }
    this.electronProvider.ipcRenderer.send('kick', data);
  }

  public kickAllDevices(message = '') {
    this.connectedDevices.forEach(device => this.kickDevice(device, message));
  }

  private addDevice(device: DeviceModel) {
    if (this.connectedDevices.findIndex(x => x.equals(device)) == -1) {
      this.connectedDevices.push(device);
    }
    this._onConnectedDevicesListChange.next(this.connectedDevices);
  }

  private removeDevice(device: DeviceModel) {
    let index = this.connectedDevices.findIndex(x => x.equals(device));
    if (index != -1) {
      this.connectedDevices.splice(index, 1);
    }
    this._onConnectedDevicesListChange.next(this.connectedDevices);
  }
}

import { Injectable, NgZone } from '@angular/core';

import { requestModel, requestModelHelo } from '../../models/request.model';
import { ElectronProvider } from '../electron/electron';
import { StorageProvider } from '../storage/storage';
import { DeviceModel } from '../../models/device.model';
import { Subject } from 'rxjs';
import { LicenseProvider } from '../license/license';

/*
  Generated class for the DevicesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DevicesProvider {
  public connectedDevices: DeviceModel[] = [];
  public onConnectedDevicesListChange: Subject<DeviceModel[]> = new Subject<DeviceModel[]>();

  constructor(
    public ngZone: NgZone,
    public storageProvider: StorageProvider,
    public electronProvider: ElectronProvider,
    private licenseProvider: LicenseProvider,
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

  addDevice(device: DeviceModel) {
    if (this.connectedDevices.findIndex(x => x.equals(device)) == -1) {
      this.connectedDevices.push(device);
    }
    this.licenseProvider.limitNOMaxConnectedDevices(device, this.connectedDevices);
    this.onConnectedDevicesListChange.next(this.connectedDevices);
  }

  removeDevice(device: DeviceModel) {
    let index = this.connectedDevices.findIndex(x => x.equals(device));
    if (index != -1) {
      this.connectedDevices.splice(index, 1);
    }
    this.onConnectedDevicesListChange.next(this.connectedDevices);
  }
}

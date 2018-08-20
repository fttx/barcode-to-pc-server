import { ErrorHandler } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { QRCodeModule } from 'angular2-qrcode';
import { IonicErrorHandler, IonicModule } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula';
import { ClipboardModule } from 'ngx-clipboard';

import { ComponentsModule } from '../components/components.module';
import { HomePage, MainMenuPopover, QrCodePairingModal, ScanSessionContextMenuPopover, ConnectedClientsPopover } from '../pages/home/home';
import { InfoPage } from '../pages/info/info';
import { SettingsPage } from '../pages/settings/settings';
import { WelcomePage } from '../pages/welcome/welcome';
import { ConfigProvider } from '../providers/config/config';
import { ElectronProvider } from '../providers/electron/electron';
import { StorageProvider } from '../providers/storage/storage';
import { UtilsProvider } from '../providers/utils/utils';
import { MyApp } from './app.component';

import { } from 'jasmine';

describe('MyApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MyApp,
        HomePage,
        WelcomePage,
        InfoPage,
        ScanSessionContextMenuPopover,
        ConnectedClientsPopover,
        QrCodePairingModal,
        MainMenuPopover,
        SettingsPage,
      ],
      imports: [
        BrowserModule,
        IonicStorageModule.forRoot(),
        QRCodeModule,
        ClipboardModule,
        DragulaModule.forRoot(),
        IonicModule.forRoot(MyApp,
          {
            // mode: 'wp',
            // iconMode: 'ios',
            // modalEnter: 'modal-slide-in',
            // modalLeave: 'modal-slide-out',
            // activator: 'highlight',
            // pageTransition: 'wp-transition',
          }),
        ComponentsModule,
      ],
      providers: [
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        ElectronProvider,
        StorageProvider,
        UtilsProvider,
        ConfigProvider
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyApp);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof MyApp).toBe(true);
  });

  // it('should have two pages', () => {
  //   expect(component.pages.length).toBe(2);
  // });

});
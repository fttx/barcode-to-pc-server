import { HomePage } from '../pages/home/home';
import { async, TestBed } from '@angular/core/testing';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicModule, Platform } from 'ionic-angular';
import { PlatformMock, SplashScreenMock, StatusBarMock } from '../../test-config/mocks-ionic';

import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { QRCodeModule } from 'angular2-qrcode';
import { IonicApp, IonicErrorHandler,  } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { ClipboardModule } from 'ngx-clipboard';

import { ComponentsModule } from '../components/components.module';
import { MainMenuPopover, QrCodePairingModal, ScanSessionContextMenuPopover } from '../pages/home/home';
import { InfoPage } from '../pages/info/info';
import { SettingsPage } from '../pages/settings/settings';
import { WelcomePage } from '../pages/welcome/welcome';
import { ConfigProvider } from '../providers/config/config';
import { ElectronProvider } from '../providers/electron/electron';
import { StorageProvider } from '../providers/storage/storage';
import { UtilsProvider } from '../providers/utils/utils';
import { MyApp } from './app.component';

import {} from 'jasmine';


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
        QrCodePairingModal,
        MainMenuPopover,
        SettingsPage,
      ],
      imports: [
        BrowserModule,
        IonicStorageModule.forRoot(),
        QRCodeModule,
        ClipboardModule,
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
        DragulaModule,
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
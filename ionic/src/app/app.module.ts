import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { QRCodeModule } from 'angular2-qrcode';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula';
import { ClipboardModule } from 'ngx-clipboard';

import { ComponentsModule } from '../components/components.module';
import { HomePage, MainMenuPopover, QrCodePairingModal, ScanSessionContextMenuPopover } from '../pages/home/home';
import { InfoPage } from '../pages/info/info';
import { SettingsPage } from '../pages/settings/settings';
import { WelcomePage } from '../pages/welcome/welcome';
import { ConfigProvider } from '../providers/config/config';
import { ElectronProvider } from '../providers/electron/electron';
import { LastToastProvider } from '../providers/last-toast/last-toast';
import { StorageProvider } from '../providers/storage/storage';
import { UtilsProvider } from '../providers/utils/utils';
import { MyApp } from './app.component';

@NgModule({
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
    DragulaModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    WelcomePage,
    InfoPage,
    ScanSessionContextMenuPopover,
    QrCodePairingModal,
    MainMenuPopover,
    SettingsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ElectronProvider,
    StorageProvider,
    UtilsProvider,
    ConfigProvider,
    LastToastProvider
  ]
})
export class AppModule { }

import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { QRCodeModule } from 'angular2-qrcode';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxPopperModule, Triggers } from 'ngx-popper';

import { ComponentsModule } from '../components/components.module';
import {
  ConnectedClientsPopover,
  HomePage,
  MainMenuPopover,
  QrCodePairingModal,
  ScanSessionContextMenuPopover,
} from '../pages/home/home';
import { InfoPage } from '../pages/info/info';
import { SettingsPage } from '../pages/settings/settings';
import { WelcomePage } from '../pages/welcome/welcome';
import { DevicesProvider } from '../providers/devices/devices';
import { ElectronProvider } from '../providers/electron/electron';
import { LastToastProvider } from '../providers/last-toast/last-toast';
import { LicenseProvider } from '../providers/license/license';
import { UtilsProvider } from '../providers/utils/utils';
import { MyApp } from './app.component';
import { ActivatePage } from '../pages/activate/activate';
import { EditOutputBlockPage } from '../components/output-block-component/edit-output-block-pop-over/edit-output-block-pop-over';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    WelcomePage,
    InfoPage,
    EditOutputBlockPage,
    ActivatePage,
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
    HttpClientModule,
    NgxPopperModule.forRoot({
      trigger: Triggers.CLICK,
      hideOnClickOutside: true,
      hideOnMouseLeave: false,
      placement: 'right',
      applyClass: 'popper-tooltip'
    }),
    IonicModule.forRoot(MyApp,
      {
        // mode: 'wp',
        // iconMode: 'ios',
        // modalEnter: 'modal-slide-in',
        // modalLeave: 'modal-slide-out',
        activator: 'highlight',
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
    EditOutputBlockPage,
    ActivatePage,
    ScanSessionContextMenuPopover,
    ConnectedClientsPopover,
    QrCodePairingModal,
    MainMenuPopover,
    SettingsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ElectronProvider,
    UtilsProvider,
    LastToastProvider,
    DevicesProvider,
    LicenseProvider
  ]
})
export class AppModule { }

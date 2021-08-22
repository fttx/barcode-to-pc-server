import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MomentModule } from 'angular2-moment';
import { QRCodeModule } from 'angular2-qrcode';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula';
import { ClipboardModule } from 'ngx-clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { NgxPopperModule, Triggers } from 'ngx-popper';
import { ComponentsModule } from '../components/components.module';
import { EditOutputBlockPage } from '../components/output-block-component/edit-output-block-pop-over/edit-output-block-pop-over';
import { ActivatePage } from '../pages/activate/activate';
import {
  ConnectedClientsPopover,
  HomePage,
  MainMenuPopover,
  QrCodePairingModal,
  ScanSessionContextMenuPopover
} from '../pages/home/home';
import { InfoPage } from '../pages/info/info';
import { SettingsPage } from '../pages/settings/settings';
import { WelcomeHelpPage } from '../pages/welcome-help/welcome-help';
import { WelcomePage } from '../pages/welcome/welcome';
import { DevicesProvider } from '../providers/devices/devices';
import { ElectronProvider } from '../providers/electron/electron';
import { LastToastProvider } from '../providers/last-toast/last-toast';
import { LicenseProvider } from '../providers/license/license';
import { UtilsProvider } from '../providers/utils/utils';
import { MyApp } from './app.component';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    WelcomePage,
    WelcomeHelpPage,
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
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
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
    MarkdownModule.forRoot(),
    MomentModule,
    NgSelectModule, FormsModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    WelcomePage,
    WelcomeHelpPage,
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
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

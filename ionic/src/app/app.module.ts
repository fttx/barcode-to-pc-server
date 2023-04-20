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
import { ActivatePage } from '../pages/activate/activate';
import { ComponentEditorAlertPage } from '../pages/component-editor/component-editor-alert/component-editor-alert';
import { ComponentEditorBarcodePage } from '../pages/component-editor/component-editor-barcode/component-editor-barcode';
import { ComponentEditorBeepPage } from '../pages/component-editor/component-editor-beep/component-editor-beep';
import { ComponentEditorCsvLookupPage } from '../pages/component-editor/component-editor-csv-lookup/component-editor-csv-lookup';
import { ComponentEditorCsvUpdatePage } from '../pages/component-editor/component-editor-csv-update/component-editor-csv-update';
import { ComponentEditorDateTimePage } from '../pages/component-editor/component-editor-date-time/component-editor-date-time';
import { ComponentEditorDelayPage } from '../pages/component-editor/component-editor-delay/component-editor-delay';
import { ComponentEditorEndifPage } from '../pages/component-editor/component-editor-endif/component-editor-endif';
import { ComponentEditorFunctionPage } from '../pages/component-editor/component-editor-function/component-editor-function';
import { ComponentEditorGSheetUpdatePage } from '../pages/component-editor/component-editor-gsheet-update/component-editor-gsheet-update';
import { ComponentEditorHttpPage } from '../pages/component-editor/component-editor-http/component-editor-http';
import { ComponentEditorIfPage } from '../pages/component-editor/component-editor-if/component-editor-if';
import { ComponentEditorKeyPage } from '../pages/component-editor/component-editor-key/component-editor-key';
import { ComponentEditorRunPage } from '../pages/component-editor/component-editor-run/component-editor-run';
import { ComponentEditorSelectOptionPage } from '../pages/component-editor/component-editor-select-option/component-editor-select-option';
import { ComponentEditorTextPage } from '../pages/component-editor/component-editor-text/component-editor-text';
import { ComponentEditorVariablePage } from '../pages/component-editor/component-editor-variable/component-editor-variable';
import { ComponentEditorWooCommercePage } from '../pages/component-editor/component-editor-woocommerce/component-editor-woocommerce';
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
import { ComponentEditorImagePage } from '../pages/component-editor/component-editor-image/component-editor-image';
import { ImageViewerPage } from '../pages/image-viewer/image-viewer';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    WelcomePage,
    WelcomeHelpPage,
    InfoPage,
    ComponentEditorAlertPage,
    ComponentEditorBarcodePage,
    ComponentEditorBeepPage,
    ComponentEditorCsvLookupPage,
    ComponentEditorCsvUpdatePage,
    ComponentEditorGSheetUpdatePage,
    ComponentEditorDateTimePage,
    ComponentEditorDelayPage,
    ComponentEditorEndifPage,
    ComponentEditorFunctionPage,
    ComponentEditorHttpPage,
    ComponentEditorIfPage,
    ComponentEditorKeyPage,
    ComponentEditorRunPage,
    ComponentEditorSelectOptionPage,
    ComponentEditorTextPage,
    ComponentEditorVariablePage,
    ComponentEditorWooCommercePage,
    ComponentEditorImagePage,
    ActivatePage,
    ScanSessionContextMenuPopover,
    ConnectedClientsPopover,
    QrCodePairingModal,
    MainMenuPopover,
    SettingsPage,
    ImageViewerPage,
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
    ComponentEditorAlertPage,
    ComponentEditorBarcodePage,
    ComponentEditorBeepPage,
    ComponentEditorCsvLookupPage,
    ComponentEditorCsvUpdatePage,
    ComponentEditorGSheetUpdatePage,
    ComponentEditorDateTimePage,
    ComponentEditorDelayPage,
    ComponentEditorEndifPage,
    ComponentEditorFunctionPage,
    ComponentEditorHttpPage,
    ComponentEditorIfPage,
    ComponentEditorKeyPage,
    ComponentEditorRunPage,
    ComponentEditorSelectOptionPage,
    ComponentEditorTextPage,
    ComponentEditorVariablePage,
    ComponentEditorWooCommercePage,
    ComponentEditorImagePage,
    ActivatePage,
    ScanSessionContextMenuPopover,
    ConnectedClientsPopover,
    QrCodePairingModal,
    MainMenuPopover,
    SettingsPage,
    ImageViewerPage,
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

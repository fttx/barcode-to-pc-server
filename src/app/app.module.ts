import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { QRCodeModule } from 'angular2-qrcode';
import { DragulaModule } from 'ng2-dragula';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { CircleTextComponent } from './components/circle-text/circle-text.component';
import { ScanSessionComponent } from './components/scan-session/scan-session.component';
import { ScanSessionsComponent } from './components/scan-sessions/scan-sessions.component';
import { StringComponentComponent } from './components/string-component/string-component.component';
import { MainPage } from './pages/main/main';
import { WelcomePage } from './pages/welcome/welcome';
import { ElectronService } from './services/electron.service';
import { EverConnectedService } from './services/ever-connected.service';
import { Storage } from './services/storage.service';
import { UtilsService } from './services/utils.service';


const routes: Routes = [
    {
        path: '',
        redirectTo: '/scan-session',
        pathMatch: 'full'
    },
    {
        path: 'welcome',
        component: WelcomePage
    },
    {
        path: 'scan-session',
        component: MainPage,
        canActivate: [EverConnectedService]
    },
];


@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        ClipboardModule,
        RouterModule.forRoot(routes, {
            // enableTracing: true 
        }),
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        FormsModule,
        QRCodeModule,
        DragulaModule,
        BrowserAnimationsModule
    ],
    providers: [
        ElectronService,
        Storage,
        EverConnectedService,
        UtilsService,
    ],
    declarations: [
        AppComponent,
        MainPage,
        ScanSessionComponent,
        ScanSessionsComponent,
        CircleTextComponent,
        WelcomePage,
        StringComponentComponent
    ],
    exports: [ // solo se si se si deve usare nel template
        CircleTextComponent,
    ],
    bootstrap: [AppComponent],
})

export class AppModule { }

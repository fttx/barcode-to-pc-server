import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';
import { QRCodeModule } from 'angular2-qrcode';

import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';


import { ElectronService } from './services/electron.service';
import { Storage } from './services/storage.service';
import { EverConnectedService } from './services/ever-connected.service';
import { UtilsService } from './services/utils.service';
import { ScanSessionsComponent } from './components/scan-sessions/scan-sessions.component';
import { ScanSessionComponent } from './components/scan-session/scan-session.component';
import { CircleTextComponent } from './components/circle-text/circle-text.component';
import { StringComponentComponent } from './components/string-component/string-component.component';

import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { DragulaModule } from 'ng2-dragula'

import { WelcomeComponent } from './pages/welcome/welcome.component';


const routes: Routes = [
    {
        path: '',
        redirectTo: '/scan-session',
        pathMatch: 'full'
    },
    {
        path: 'welcome',
        component: WelcomeComponent
    },
    {
        path: 'scan-session',
        component: MainComponent,
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
        DragulaModule
    ],
    providers: [
        ElectronService,
        Storage,
        EverConnectedService,
        UtilsService,
    ],
    declarations: [
        AppComponent,
        MainComponent,
        ScanSessionComponent,
        ScanSessionsComponent,
        CircleTextComponent,
        WelcomeComponent,
        StringComponentComponent
    ],
    exports: [ // solo se si se si deve usare nel template
        CircleTextComponent,
    ],
    bootstrap: [AppComponent],
})

export class AppModule { }

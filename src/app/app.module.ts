import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'angular2-clipboard';
import { LocalStorageService, LOCAL_STORAGE_SERVICE_CONFIG } from 'angular-2-local-storage';

import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';

import { ScanSessionsServer } from './services/scan-sessions-server.service'
import { Storage } from './services/storage.service'
import { ScanSessionsComponent } from './components/scan-sessions/scan-sessions.component';
import { ScanSessionComponent } from './components/scan-session/scan-session.component';
import { CircleTextComponent } from './components/circle-text/circle-text.component';

import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';

const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
];

let localStorageServiceConfig = {
    prefix: 'barcode-to-pc-server',
    storageType: 'localStorage'
};

@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        ClipboardModule,
        RouterModule.forRoot(routes, { useHash: true }),
        ModalModule,
        FormsModule
    ],
    providers: [
        ScanSessionsServer,
        Storage,
        LocalStorageService,
        { provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: localStorageServiceConfig },
    ],
    declarations: [
        AppComponent,
        MainComponent,
        ScanSessionComponent,
        ScanSessionsComponent,
        CircleTextComponent
    ],
    exports: [ // solo se si se si deve usare nel template
        CircleTextComponent,
    ],
    bootstrap: [AppComponent],
})

export class AppModule { }

import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'angular2-clipboard';

import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';

import { ScanSessionsService } from './services/scan-sessions.service'
import { ScanSessionsComponent } from './components/scan-sessions/scan-sessions.component';
import { ScanSessionComponent } from './components/scan-session/scan-session.component';
import { CircleTextComponent } from './components/circle-text/circle-text.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
];

@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        ClipboardModule,
        RouterModule.forRoot(routes, { useHash: true }),
        NgbModule.forRoot(),
    ],
    providers: [ScanSessionsService],
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

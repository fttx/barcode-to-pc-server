import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { ScanSessionsService } from '../services/scan-sessions.service'

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ScanSessionsComponent } from './scan-sessions/scan-sessions.component';
import { ScanSessionComponent } from './scan-session/scan-session.component';
import { CircleTextComponent } from '../components/circle-text';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/-1',
    pathMatch: 'full'
  },
  {
    path: ':index',
    component: ScanSessionComponent,
  },
];


@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    NgbModule.forRoot()

  ],
  providers: [ScanSessionsService],
  declarations: [
    ScanSessionComponent,
    ScanSessionsComponent,
    CircleTextComponent
  ],
  exports: [ // solo se si se si deve usare nel template
    RouterModule,
    ScanSessionsComponent,
    CircleTextComponent,
  ],
})

export class AppRoutingModule { }

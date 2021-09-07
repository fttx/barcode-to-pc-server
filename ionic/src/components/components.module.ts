import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { CircleTextComponent } from './circle-text/circle-text';
import { StatusBarComponent } from './status-bar/status-bar';
import { OutputBlockComponent } from './output-block-component/output-block-component';
import { InfoBoxComponent } from './info-box/info-box';
import { NotificationComponent } from './notification/notification';
import { ComponentEditorComponent } from './component-editor/component-editor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { createTranslateLoader } from '../app/app.module';

@NgModule({
  declarations: [CircleTextComponent,
    CircleTextComponent,
    CircleTextComponent,
    OutputBlockComponent,
    StatusBarComponent,
    InfoBoxComponent,
    NotificationComponent,
    ComponentEditorComponent],
  imports: [
    IonicModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  ],
  exports: [CircleTextComponent,
    CircleTextComponent,
    CircleTextComponent,
    OutputBlockComponent,
    StatusBarComponent,
    InfoBoxComponent,
    NotificationComponent,
    ComponentEditorComponent]
})
export class ComponentsModule { }

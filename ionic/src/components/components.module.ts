import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { IonicModule } from 'ionic-angular';
import { createTranslateLoader } from '../app/app.module';
import { CircleTextComponent } from './circle-text/circle-text';
import { ComponentEditorComponent } from './component-editor/component-editor';
import { InfoBoxComponent } from './info-box/info-box';
import { NotificationComponent } from './notification/notification';
import { OutputComponentComponent } from './output-component-component/output-component-component';
import { StatusBarComponent } from './status-bar/status-bar';


@NgModule({
  declarations: [CircleTextComponent,
    CircleTextComponent,
    CircleTextComponent,
    OutputComponentComponent,
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
    OutputComponentComponent,
    StatusBarComponent,
    InfoBoxComponent,
    NotificationComponent,
    ComponentEditorComponent]
})
export class ComponentsModule { }

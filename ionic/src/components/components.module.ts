import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { CircleTextComponent } from './circle-text/circle-text';
import { StatusBarComponent } from './status-bar/status-bar';
import { OutputBlockComponent } from './output-block-component/output-block-component';
import { InfoBoxComponent } from './info-box/info-box';
import { NotificationComponent } from './notification/notification';

@NgModule({
    declarations: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
        OutputBlockComponent,
        StatusBarComponent,
    InfoBoxComponent,
    NotificationComponent],
    imports: [IonicModule],
    exports: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
        OutputBlockComponent,
        StatusBarComponent,
    InfoBoxComponent,
    NotificationComponent]
})
export class ComponentsModule { }

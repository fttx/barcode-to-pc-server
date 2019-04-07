import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { CircleTextComponent } from './circle-text/circle-text';
import { StatusBarComponent } from './status-bar/status-bar';
import { OutputBlockComponent } from './output-block-component/output-block-component';

@NgModule({
    declarations: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
        OutputBlockComponent,
        StatusBarComponent],
    imports: [IonicModule],
    exports: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
        OutputBlockComponent,
        StatusBarComponent]
})
export class ComponentsModule { }

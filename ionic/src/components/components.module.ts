import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { CircleTextComponent } from './circle-text/circle-text';
import { StringComponent } from './string-component/string-component';
import { StatusBarComponent } from './status-bar/status-bar';

@NgModule({
    declarations: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
    StringComponent,
    StringComponent,
    StatusBarComponent],
    imports: [IonicModule],
    exports: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
    StringComponent,
    StringComponent,
    StatusBarComponent]
})
export class ComponentsModule { }

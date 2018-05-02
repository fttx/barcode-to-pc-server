import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { CircleTextComponent } from './circle-text/circle-text';
import { StringComponent } from './string-component/string-component';

@NgModule({
    declarations: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
    StringComponent,
    StringComponent],
    imports: [IonicModule],
    exports: [CircleTextComponent,
        CircleTextComponent,
        CircleTextComponent,
    StringComponent,
    StringComponent]
})
export class ComponentsModule { }

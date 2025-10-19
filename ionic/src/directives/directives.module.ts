import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { VariableInjectorDirective } from './variable-injector.directive';

@NgModule({
    declarations: [
        VariableInjectorDirective,
    ],
    imports: [
        IonicModule,
    ],
    exports: [
        VariableInjectorDirective,
    ]
})
export class DirectivesModule { }

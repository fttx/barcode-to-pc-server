import { Component, Input } from '@angular/core';

import { StringComponentModel } from '../../models/string-component.model';


/**
 * Generated class for the CustomVariableComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'string-component',
  templateUrl: 'string-component.html'
})
export class StringComponent {
  @Input() component: StringComponentModel;

  public editMode = false;
  public value = '';

  constructor() { }

  ngOnInit() {
    this.value = this.component.name;
  }

  onComponentClicked(event) {
    event.stopPropagation();

    // if (this.component.type == 'function') {
    //   this.component.name = this.value;
    //   this.component.value = this.value;
    // } else {
    this.component.name = this.value;
    this.component.value = this.value;
    // }
    this.editMode = false;
  }

  getVariableColor() {
    // [class.btn-primary]="customVariable.type == 'key'"
    // [class.btn-success]="customVariable.type == 'variable'"
    // [class.btn-warning]="customVariable.type == 'text'"
    // [class.btn-info]="customVariable.type == 'barcode' || customVariable.type == 'function'"
    // if (this.customVariable.type == 'key') {
    //   return 'light'
    // }

    // if (this.customVariable.type == 'variable') {
    //   return 'variable'
    // }

    // if (this.customVariable.type == 'text') {
    //   return 'danger'
    // }
    return 'block-' + this.component.type // sass variable name: block-barcode: #...
  }
}

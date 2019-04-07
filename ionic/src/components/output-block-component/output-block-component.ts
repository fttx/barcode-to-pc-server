import { Component, Input } from '@angular/core';
import { OutputBlockModel } from '../../models/output-block.model';



/**
 * Generated class for the CustomVariableComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'output-block-component',
  templateUrl: 'output-block-component.html'
})
export class OutputBlockComponent {
  @Input() outputBlock: OutputBlockModel;

  public editMode = false;
  public inputValue = '';

  constructor() { }

  ngOnInit() {
    // this.value = this.outputBlock.name;
  }

  onOutputBlockClicked(event) {
    event.stopPropagation();

    // if (this.outputBlock.type == 'function') {
    //   this.outputBlock.name = this.value;
    //   this.outputBlock.value = this.value;
    // } else {
    // this.outputBlock.value = this.inputValue;
    // }
    this.editMode = false;
  }


  displayedName() {
    if (this.outputBlock.editable && this.outputBlock.value && this.outputBlock.value.length) {
      return this.outputBlock.value;
    }
    return this.outputBlock.name;
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
    return 'output-block-component-' + this.outputBlock.type // sass variable name: output-block-component-barcode: #... in variables.scss file
  }
}

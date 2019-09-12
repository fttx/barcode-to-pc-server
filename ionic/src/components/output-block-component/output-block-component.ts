import { Component, Input } from '@angular/core';
import { OutputBlockModel } from '../../models/output-block.model';
import { AlertController, AlertOptions } from 'ionic-angular';


@Component({
  selector: 'output-block-component',
  templateUrl: 'output-block-component.html'
})
export class OutputBlockComponent {
  @Input() outputBlock: OutputBlockModel;

  constructor(
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    // this.value = this.outputBlock.name;
  }

  onClick(event) {
    event.stopPropagation();

    let inputs = [];
    switch (this.outputBlock.type) {
      case 'key': {
        inputs.push(
          { type: 'checkbox', checked: this.outputBlock.modifiers.findIndex(x => x == 'alt') != -1, label: 'Alt', value: 'alt' },
          { type: 'checkbox', checked: this.outputBlock.modifiers.findIndex(x => x == 'command') != -1, label: 'Command', value: 'command' },
          { type: 'checkbox', checked: this.outputBlock.modifiers.findIndex(x => x == 'control') != -1, label: 'Control', value: 'control' },
          { type: 'checkbox', checked: this.outputBlock.modifiers.findIndex(x => x == 'shift') != -1, label: 'Shift', value: 'shift' }
        );
        break;
      }
      case 'function': {
        inputs.push(
          { type: 'text', label: 'Function', value: 'barcode.replace("a", "b")' },
        );
        break;
      }
      case 'variable':
      case 'barcode': {
        inputs.push({ type: 'checkbox', checked: this.outputBlock.skipOutput, label: 'Skip output', value: 'skipOutput' });
        break;
      }
      case 'text': {
        inputs.push({ type: 'text', label: 'Text', value: 'custom text' });
        break;
      }
      case 'delay': {
        inputs.push({ type: 'number', label: 'Milliseconds', value: '1000' });
        break;
      }
      case 'http': {
        inputs.push({ type: 'text', label: 'URL', value: this.outputBlock.value || 'https://www.google.com/' });
        break;
      }
      case 'if':
      case 'endif':
      default: { break; }
    }

    this.alertCtrl.create({
      // title: this.outputBlock.name.charAt(0) + this.outputBlock.name.slice(1).toLocaleLowerCase() + ' options',
      title: this.outputBlock.name,
      message: inputs.length == 0 ? 'No options available for this component' : null,
      inputs: inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          // handler: (opts: AlertOptions) => {
          handler: (opts: any) => {
            console.log(opts);

            switch (this.outputBlock.type) {
              case 'key': {
                this.outputBlock.modifiers = opts;
                break;
              }
              case 'function': {
                this.outputBlock.value = opts[0];
                break;
              }
              case 'variable':
              case 'barcode': {
                this.outputBlock.skipOutput = (opts == 'skipOutput');
                break;
              }
              case 'text': {
                this.outputBlock.value = opts[0];
                break;
              }
              case 'delay': {
                this.outputBlock.value = opts[0];
                break;
              }
              case 'http': {
                this.outputBlock.value = opts[0];
                break;
              }
              case 'if':
              case 'endif':
              default: { break; }
            }
            console.log('@modifiers', 'edited component: ', this.outputBlock)
          }
        }]
    }).present();
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

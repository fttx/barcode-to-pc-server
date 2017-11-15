import { Component, OnInit, Input } from '@angular/core';
import { StringComponentModel } from "app/models/string-component.model";

@Component({
  selector: 'string-component',
  templateUrl: './string-component.component.html',
  styleUrls: ['./string-component.component.scss']
})
export class StringComponentComponent implements OnInit {
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
}

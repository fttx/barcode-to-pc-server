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

  constructor() { }

  ngOnInit() {
  }

}

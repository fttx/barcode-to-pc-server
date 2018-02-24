import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'circle-text',
  template: `
    <div class="circle-text" [style.background-color]="getRenderColor()">
      <i class="icon ion-checkmark" *ngIf="checked"></i>
      {{ getRenderLetters() }}
    </div>`,
  styleUrls: ['./circle-text.component.scss']    
})

export class CircleTextComponent implements OnInit {
  @Input() value: string;
  @Input() color: string;
  @Input() checked: boolean = false;

  private static colors = ['e57373', 'f06292', 'ba68c8', '9575cd', '7986cb', '64b5f6', '4fc3f7', '4dd0e1', '4db6ac', '81c784', 'aed581', 'ff8a65', 'd4e157', 'ffd54f', 'ffb74d', 'a1887f', '90a4ae'];
  public letters: string;

  constructor() {

  }

  ngOnInit() {
    this.letters = this.value[0] + this.value[1];
  }

  getRenderColor() {
    if (this.checked) {
      return 'grey'
    }

    if (this.color == null || this.color == '') {
      let colors = CircleTextComponent.colors;
      return '#' + colors[Math.abs(this.hashCode(this.value)) % colors.length].toString();
    }

    return this.color;
  }

  getRenderLetters() {
    return this.checked ? '' : (this.value[0] + this.value[1]);
  }

  private hashCode(key) {
    var hash = 0, i, chr, len;
    if (key.length === 0) return hash;
    for (i = 0, len = key.length; i < len; i++) {
      chr = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

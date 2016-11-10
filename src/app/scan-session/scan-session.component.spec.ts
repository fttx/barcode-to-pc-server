/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ScanSessionComponent } from './scan-session.component';

describe('ScanSessionComponent', () => {
  let component: ScanSessionComponent;
  let fixture: ComponentFixture<ScanSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

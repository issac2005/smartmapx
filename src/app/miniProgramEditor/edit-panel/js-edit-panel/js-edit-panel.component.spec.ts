import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {JsEditPanelComponent} from './js-edit-panel.component';

describe('JsEditPanelComponent', () => {
  let component: JsEditPanelComponent;
  let fixture: ComponentFixture<JsEditPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsEditPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

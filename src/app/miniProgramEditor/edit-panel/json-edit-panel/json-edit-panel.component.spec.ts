import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonEditPanelComponent } from './json-edit-panel.component';

describe('JsonEditPanelComponent', () => {
  let component: JsonEditPanelComponent;
  let fixture: ComponentFixture<JsonEditPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsonEditPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonEditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropPanelComponent } from './prop-panel.component';

describe('PropPanelComponent', () => {
  let component: PropPanelComponent;
  let fixture: ComponentFixture<PropPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

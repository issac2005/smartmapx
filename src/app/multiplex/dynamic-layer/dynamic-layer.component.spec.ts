import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicLayerComponent } from './dynamic-layer.component';

describe('DynamicLayerComponent', () => {
  let component: DynamicLayerComponent;
  let fixture: ComponentFixture<DynamicLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

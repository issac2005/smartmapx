import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotStyleComponent } from './plot-style.component';

describe('PlotStyleComponent', () => {
  let component: PlotStyleComponent;
  let fixture: ComponentFixture<PlotStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlotStyleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmxSliderComponent } from './smx-slider.component';

describe('SmxSliderComponent', () => {
  let component: SmxSliderComponent;
  let fixture: ComponentFixture<SmxSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmxSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmxSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

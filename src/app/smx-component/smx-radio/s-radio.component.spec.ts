import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SRadioComponent } from './s-radio.component';

describe('SRadioComponent', () => {
  let component: SRadioComponent;
  let fixture: ComponentFixture<SRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

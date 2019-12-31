import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SCheckboxComponent } from './s-checkbox.component';

describe('SCheckboxComponent', () => {
  let component: SCheckboxComponent;
  let fixture: ComponentFixture<SCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SInputNumberComponent } from './s-input-number.component';

describe('SInputNumberComponent', () => {
  let component: SInputNumberComponent;
  let fixture: ComponentFixture<SInputNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SInputNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SInputNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

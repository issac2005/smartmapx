import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SSelectCheckboxComponent } from './s-select-checkbox.component';

describe('SSelectCheckboxComponent', () => {
  let component: SSelectCheckboxComponent;
  let fixture: ComponentFixture<SSelectCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SSelectCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SSelectCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

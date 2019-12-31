import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SIconComponent } from './s-icon.component';

describe('SIconComponent', () => {
  let component: SIconComponent;
  let fixture: ComponentFixture<SIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

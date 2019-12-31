import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleDetailComponent } from './style-detail.component';

describe('StyleDetailComponent', () => {
  let component: StyleDetailComponent;
  let fixture: ComponentFixture<StyleDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

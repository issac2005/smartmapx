import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmxInputInfoComponent } from './smx-input-info.component';

describe('SmxInputInfoComponent', () => {
  let component: SmxInputInfoComponent;
  let fixture: ComponentFixture<SmxInputInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmxInputInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmxInputInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

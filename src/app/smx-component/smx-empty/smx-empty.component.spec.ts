import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmxEmptyComponent } from './smx-empty.component';

describe('SmxEmptyComponent', () => {
  let component: SmxEmptyComponent;
  let fixture: ComponentFixture<SmxEmptyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmxEmptyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmxEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

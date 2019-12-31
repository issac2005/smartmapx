import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStyleModalComponent } from './create-style-modal.component';

describe('CreateStyleModalComponent', () => {
  let component: CreateStyleModalComponent;
  let fixture: ComponentFixture<CreateStyleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateStyleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStyleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

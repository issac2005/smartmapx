import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniProgramModalComponent } from './mini-program-modal.component';

describe('MiniProgramModalComponent', () => {
  let component: MiniProgramModalComponent;
  let fixture: ComponentFixture<MiniProgramModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniProgramModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniProgramModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

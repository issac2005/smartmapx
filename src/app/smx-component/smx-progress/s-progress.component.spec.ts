import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SProgressComponent } from './s-progress.component';

describe('SProgressComponent', () => {
  let component: SProgressComponent;
  let fixture: ComponentFixture<SProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

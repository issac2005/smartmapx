import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SUploadComponent } from './s-upload.component';

describe('SUploadComponent', () => {
  let component: SUploadComponent;
  let fixture: ComponentFixture<SUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SLoadingComponent } from './s-loading.component';

describe('SLoadingComponent', () => {
  let component: SLoadingComponent;
  let fixture: ComponentFixture<SLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmxRasterComponent } from './smx-raster.component';

describe('SmxRasterComponent', () => {
  let component: SmxRasterComponent;
  let fixture: ComponentFixture<SmxRasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmxRasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmxRasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

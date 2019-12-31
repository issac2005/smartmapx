import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RasterPanelComponent } from './raster-panel.component';

describe('RasterPanelComponent', () => {
  let component: RasterPanelComponent;
  let fixture: ComponentFixture<RasterPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RasterPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RasterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcePanelComponent } from './source-panel.component';

describe('SourcePanelComponent', () => {
  let component: SourcePanelComponent;
  let fixture: ComponentFixture<SourcePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourcePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourcePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

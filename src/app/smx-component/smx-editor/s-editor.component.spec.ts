import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SEditorComponent } from './s-editor.component';

describe('SEditorComponent', () => {
  let component: SEditorComponent;
  let fixture: ComponentFixture<SEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

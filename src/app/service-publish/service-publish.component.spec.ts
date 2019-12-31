import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePublishComponent } from './service-publish.component';

describe('ServicePublishComponent', () => {
  let component: ServicePublishComponent;
  let fixture: ComponentFixture<ServicePublishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicePublishComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

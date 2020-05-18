import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KalJsfDocComponent } from './kal-jsf-doc.component';

describe('KalJsfDocComponent', () => {
  let component: KalJsfDocComponent;
  let fixture: ComponentFixture<KalJsfDocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [KalJsfDocComponent]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(KalJsfDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

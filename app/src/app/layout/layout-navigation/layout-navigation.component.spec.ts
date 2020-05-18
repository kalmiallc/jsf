import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutNavigationComponent } from './layout-navigation.component';

describe('LayoutNavigationComponent', () => {
  let component: LayoutNavigationComponent;
  let fixture: ComponentFixture<LayoutNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

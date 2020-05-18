import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutEmptyComponent } from './layout-empty.component';

describe('LayoutEmptyComponent', () => {
  let component: LayoutEmptyComponent;
  let fixture: ComponentFixture<LayoutEmptyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutEmptyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

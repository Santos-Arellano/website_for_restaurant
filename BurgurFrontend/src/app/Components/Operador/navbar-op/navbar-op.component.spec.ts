import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarOpComponent } from './navbar-op.component';

describe('NavbarOpComponent', () => {
  let component: NavbarOpComponent;
  let fixture: ComponentFixture<NavbarOpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarOpComponent]
    });
    fixture = TestBed.createComponent(NavbarOpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

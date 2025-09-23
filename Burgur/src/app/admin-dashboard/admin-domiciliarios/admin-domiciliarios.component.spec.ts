import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDomiciliariosComponent } from './admin-domiciliarios.component';

describe('AdminDomiciliariosComponent', () => {
  let component: AdminDomiciliariosComponent;
  let fixture: ComponentFixture<AdminDomiciliariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDomiciliariosComponent]
    });
    fixture = TestBed.createComponent(AdminDomiciliariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

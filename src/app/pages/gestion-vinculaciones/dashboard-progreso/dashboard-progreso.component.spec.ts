import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProgresoComponent } from './dashboard-progreso.component';

describe('DashboardProgresoComponent', () => {
  let component: DashboardProgresoComponent;
  let fixture: ComponentFixture<DashboardProgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardProgresoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardProgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

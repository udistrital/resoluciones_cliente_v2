import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSemaforoResolucionesComponent } from './dashboard-semaforo-resoluciones.component';

describe('DashboardSemaforoResolucionesComponent', () => {
  let component: DashboardSemaforoResolucionesComponent;
  let fixture: ComponentFixture<DashboardSemaforoResolucionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardSemaforoResolucionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSemaforoResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

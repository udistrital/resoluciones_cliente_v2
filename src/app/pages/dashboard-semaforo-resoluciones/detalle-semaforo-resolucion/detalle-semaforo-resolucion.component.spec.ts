import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemaforoResolucionDashboardComponent } from './detalle-semaforo-resolucion.component';

describe('SemaforoResolucionDashboardComponent', () => {
  let component: SemaforoResolucionDashboardComponent;
  let fixture: ComponentFixture<SemaforoResolucionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemaforoResolucionDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SemaforoResolucionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

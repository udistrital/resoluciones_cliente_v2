import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionResolucionesComponent } from './gestion-resoluciones.component';

describe('GestionResolucionesComponent', () => {
  let component: GestionResolucionesComponent;
  let fixture: ComponentFixture<GestionResolucionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionResolucionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

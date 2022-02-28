import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionResolucionesComponent } from './aprobacion-resoluciones.component';

describe('AprobacionResolucionesComponent', () => {
  let component: AprobacionResolucionesComponent;
  let fixture: ComponentFixture<AprobacionResolucionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprobacionResolucionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobacionResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDetalleResolucionComponent } from './form-detalle-resolucion.component';

describe('FormDetalleResolucionComponent', () => {
  let component: FormDetalleResolucionComponent;
  let fixture: ComponentFixture<FormDetalleResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormDetalleResolucionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDetalleResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

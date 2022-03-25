import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDisponibilidadComponent } from './modal-disponibilidad.component';

describe('ModalDisponibilidadComponent', () => {
  let component: ModalDisponibilidadComponent;
  let fixture: ComponentFixture<ModalDisponibilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDisponibilidadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDisponibilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

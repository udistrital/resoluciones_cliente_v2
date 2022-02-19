import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReduccionesComponent } from './modal-reducciones.component';

describe('ModalReduccionesComponent', () => {
  let component: ModalReduccionesComponent;
  let fixture: ComponentFixture<ModalReduccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalReduccionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalReduccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

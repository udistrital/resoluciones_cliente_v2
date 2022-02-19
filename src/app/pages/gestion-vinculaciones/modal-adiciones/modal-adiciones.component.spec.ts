import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdicionesComponent } from './modal-adiciones.component';

describe('ModalAdicionesComponent', () => {
  let component: ModalAdicionesComponent;
  let fixture: ComponentFixture<ModalAdicionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAdicionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAdicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

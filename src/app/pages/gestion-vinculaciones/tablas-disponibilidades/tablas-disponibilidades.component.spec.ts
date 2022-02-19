import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablasDisponibilidadesComponent } from './tablas-disponibilidades.component';

describe('TablasDisponibilidadesComponent', () => {
  let component: TablasDisponibilidadesComponent;
  let fixture: ComponentFixture<TablasDisponibilidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablasDisponibilidadesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablasDisponibilidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

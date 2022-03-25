import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarVinculacionesComponent } from './listar-vinculaciones.component';

describe('ListarVinculacionesComponent', () => {
  let component: ListarVinculacionesComponent;
  let fixture: ComponentFixture<ListarVinculacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarVinculacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarVinculacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

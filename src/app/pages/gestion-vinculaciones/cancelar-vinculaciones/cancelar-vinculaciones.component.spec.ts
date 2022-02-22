import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarVinculacionesComponent } from './cancelar-vinculaciones.component';

describe('CancelarVinculacionesComponent', () => {
  let component: CancelarVinculacionesComponent;
  let fixture: ComponentFixture<CancelarVinculacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelarVinculacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelarVinculacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

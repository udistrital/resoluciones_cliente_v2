import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteFinancieraComponent } from './reporte-financiera.component';

describe('ReporteFinancieraComponent', () => {
  let component: ReporteFinancieraComponent;
  let fixture: ComponentFixture<ReporteFinancieraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteFinancieraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteFinancieraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

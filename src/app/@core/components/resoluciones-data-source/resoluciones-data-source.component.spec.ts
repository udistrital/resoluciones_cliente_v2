import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolucionesDataSourceComponent } from './resoluciones-data-source.component';

describe('ResolucionesDataSourceComponent', () => {
  let component: ResolucionesDataSourceComponent;
  let fixture: ComponentFixture<ResolucionesDataSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResolucionesDataSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolucionesDataSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

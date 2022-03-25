import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RequestManager } from '../services/requestManager';

import { GestionResolucionesComponent } from './gestion-resoluciones.component';

describe('GestionResolucionesComponent', () => {
  let component: GestionResolucionesComponent;
  let fixture: ComponentFixture<GestionResolucionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([{path: 'pages/gestion_resoluciones', component: GestionResolucionesComponent}]),
      ],
      declarations: [ GestionResolucionesComponent ],
      providers: [ RequestManager, HttpClient, HttpHandler ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

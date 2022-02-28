import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RequestManager } from '../services/requestManager';

import { AdminResolucionesComponent } from './admin-resoluciones.component';

describe('AdminResolucionesComponent', () => {
  let component: AdminResolucionesComponent;
  let fixture: ComponentFixture<AdminResolucionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([{ path: 'pages/admin-resoluciones', component: AdminResolucionesComponent }])
      ],
      declarations: [AdminResolucionesComponent],
      providers: [RequestManager, HttpClient, HttpHandler]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

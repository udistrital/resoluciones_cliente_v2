import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RequestManager } from '../../services/requestManager';

import { ConsultaDocenteComponent } from './consulta-docente.component';

describe('ConsultaDocenteComponent', () => {
  let component: ConsultaDocenteComponent;
  let fixture: ComponentFixture<ConsultaDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([{path: 'pages/consulta_docente', component: ConsultaDocenteComponent}]),
      ],
      declarations: [ ConsultaDocenteComponent ],
      providers: [ RequestManager, HttpClient, HttpHandler ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

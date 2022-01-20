import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { RequestManager } from '../services/requestManager';
import { MatDividerModule } from '@angular/material/divider';

import { FormDetalleResolucionComponent } from './form-detalle-resolucion.component';

describe('FormDetalleResolucionComponent', () => {
  let component: FormDetalleResolucionComponent;
  let fixture: ComponentFixture<FormDetalleResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormDetalleResolucionComponent ],
      imports: [
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatGridListModule,
        MatExpansionModule,
        MatDividerModule,
        Ng2SmartTableModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [ RequestManager ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDetalleResolucionComponent);
    component = fixture.componentInstance;
    component.limpiarFormulario();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

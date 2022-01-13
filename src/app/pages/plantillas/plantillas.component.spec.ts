import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { RequestManager } from '../services/requestManager';

import { FormDetalleResolucionComponent } from '../form-detalle-resolucion/form-detalle-resolucion.component';
import { PlantillasComponent } from './plantillas.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlantillasComponent', () => {
  let component: PlantillasComponent;
  let fixture: ComponentFixture<PlantillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatSelectModule,
        MatGridListModule,
        MatExpansionModule,
        MatDividerModule,
        Ng2SmartTableModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{path: 'pages/plantillas', component: PlantillasComponent}]),
      ],
      declarations: [ 
        PlantillasComponent, 
        FormDetalleResolucionComponent,
      ],
      providers: [ RequestManager ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

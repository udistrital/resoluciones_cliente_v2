import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestManager } from './services/requestManager';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { OasGridColsDirective } from './directives/oas-grid-cols.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { InterceptorService } from '../loader/interceptor.service';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { FormDetalleResolucionComponent } from './form-detalle-resolucion/form-detalle-resolucion.component';
import { GestionResolucionesComponent } from './gestion-resoluciones/gestion-resoluciones.component';
import { DetalleResolucionComponent } from './gestion-resoluciones/detalle-resolucion/detalle-resolucion.component';
import { GeneracionResolucionComponent } from './gestion-resoluciones/generacion-resolucion/generacion-resolucion.component';
import { ConsultaDocenteComponent } from './gestion-resoluciones/consulta-docente/consulta-docente.component';
import { AdminResolucionesComponent } from './admin-resoluciones/admin-resoluciones.component';
import { ExpedirVinculacionComponent } from './admin-resoluciones/expedir-vinculacion/expedir-vinculacion.component';
import { ExpedirCancelacionComponent } from './admin-resoluciones/expedir-cancelacion/expedir-cancelacion.component';
import { ExpedirModificacionComponent } from './admin-resoluciones/expedir-modificacion/expedir-modificacion.component';
import { AprobacionResolucionesComponent } from './aprobacion-resoluciones/aprobacion-resoluciones.component';
import { VincularDocentesComponent } from './gestion-vinculaciones/vincular-docentes/vincular-docentes.component';
import { ModalDisponibilidadComponent } from './gestion-vinculaciones/modal-disponibilidad/modal-disponibilidad.component';
import { ListarVinculacionesComponent } from './gestion-vinculaciones/listar-vinculaciones/listar-vinculaciones.component';
import { CancelarVinculacionesComponent } from './gestion-vinculaciones/cancelar-vinculaciones/cancelar-vinculaciones.component';
import { ModalAdicionesComponent } from './gestion-vinculaciones/modal-adiciones/modal-adiciones.component';
import { ModalReduccionesComponent } from './gestion-vinculaciones/modal-reducciones/modal-reducciones.component';
import { TablasDisponibilidadesComponent } from './gestion-vinculaciones/tablas-disponibilidades/tablas-disponibilidades.component';
import { ModalDocumentoViewerComponent } from './modal-documento-viewer/modal-documento-viewer.component';
import { RpVinculacionesComponent } from './gestion-vinculaciones/rp-vinculaciones/rp-vinculaciones.component';
import { RpSelectorComponent } from '../@core/components/rp-selector/rp-selector.component';
import { NavGuard } from '../@core/components/guard/nav.guard';
import { RoleGuard } from '../@core/components/guard/role.guard';
import { ReporteFinancieraComponent } from './reporte-financiera/reporte-financiera.component';
import { DashboardProgresoComponent } from './gestion-vinculaciones/dashboard-progreso/dashboard-progreso.component';


const pagesComponents = [
  RpVinculacionesComponent,
  DashboardProgresoComponent,
  RpSelectorComponent,
  TablasDisponibilidadesComponent,
  CancelarVinculacionesComponent,
  ListarVinculacionesComponent,
  ModalAdicionesComponent,
  ModalReduccionesComponent,
  ModalDocumentoViewerComponent,
  ModalDisponibilidadComponent,
  VincularDocentesComponent,
  GeneracionResolucionComponent,
  GestionResolucionesComponent,
  DetalleResolucionComponent,
  ConsultaDocenteComponent,
  FormDetalleResolucionComponent,
  AdminResolucionesComponent,
  ExpedirVinculacionComponent,
  ExpedirCancelacionComponent,
  ExpedirModificacionComponent,
  AprobacionResolucionesComponent,
  ReporteFinancieraComponent,
  PlantillasComponent,
  DashboardComponent,
  PagesComponent,
];

const materialModules = [
  MatDialogModule,
  MatCardModule,
  MatTabsModule,
  MatListModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatGridListModule,
  MatExpansionModule,
  MatButtonModule,
  MatStepperModule,
  MatRadioModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatButtonToggleModule
];
@NgModule({
  declarations: [
    ...pagesComponents,
    OasGridColsDirective,
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    Ng2SmartTableModule,
    NgxExtendedPdfViewerModule,
    ...materialModules
  ],
  providers: [
    NavGuard,
    RoleGuard,
    RequestManager,
    MatDatepickerModule,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ]
})
export class PagesModule { }

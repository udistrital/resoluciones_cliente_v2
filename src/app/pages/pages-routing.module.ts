import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminResolucionesComponent } from './admin-resoluciones/admin-resoluciones.component';
import { AprobacionResolucionesComponent } from './aprobacion-resoluciones/aprobacion-resoluciones.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultaDocenteComponent } from './gestion-resoluciones/consulta-docente/consulta-docente.component';
import { DetalleResolucionComponent } from './gestion-resoluciones/detalle-resolucion/detalle-resolucion.component';
import { GeneracionResolucionComponent } from './gestion-resoluciones/generacion-resolucion/generacion-resolucion.component';
import { GestionResolucionesComponent } from './gestion-resoluciones/gestion-resoluciones.component';
import { PagesComponent } from './pages.component';
import { PlantillasComponent } from './plantillas/plantillas.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'plantillas',
      component: PlantillasComponent,
    },
    {
      path: 'gestion_resoluciones',
      component: GestionResolucionesComponent,
    },
    {
      path: 'detalle_resolucion',
      component: DetalleResolucionComponent,
    },
    {
      path: 'generacion_resolucion',
      component: GeneracionResolucionComponent,
    },
    {
      path: 'consulta_docente',
      component: ConsultaDocenteComponent,
    },
    {
      path: 'resolucion_administracion',
      component: AdminResolucionesComponent,
    },
    {
      path: 'resolucion_aprobacion',
      component: AprobacionResolucionesComponent
    },
    {
      path: '', redirectTo: 'dashboard', pathMatch: 'full',
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

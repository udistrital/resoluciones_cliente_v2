import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminResolucionesComponent } from './admin-resoluciones/admin-resoluciones.component';
import { AprobacionResolucionesComponent } from './aprobacion-resoluciones/aprobacion-resoluciones.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultaDocenteComponent } from './gestion-resoluciones/consulta-docente/consulta-docente.component';
import { DetalleResolucionComponent } from './gestion-resoluciones/detalle-resolucion/detalle-resolucion.component';
import { GeneracionResolucionComponent } from './gestion-resoluciones/generacion-resolucion/generacion-resolucion.component';
import { GestionResolucionesComponent } from './gestion-resoluciones/gestion-resoluciones.component';
import { CancelarVinculacionesComponent } from './gestion-vinculaciones/cancelar-vinculaciones/cancelar-vinculaciones.component';
import { ListarVinculacionesComponent } from './gestion-vinculaciones/listar-vinculaciones/listar-vinculaciones.component';
import { VincularDocentesComponent } from './gestion-vinculaciones/vincular-docentes/vincular-docentes.component';
import { RpVinculacionesComponent } from './gestion-vinculaciones/rp-vinculaciones/rp-vinculaciones.component';
import { PagesComponent } from './pages.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { NavGuard } from '../@core/components/guard/nav.guard';
import { RoleGuard } from '../@core/components/guard/role.guard';
import { ReporteFinancieraComponent } from './reporte-financiera/reporte-financiera.component';

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
      canActivate: [NavGuard, RoleGuard],
      runGuardsAndResolvers: 'always',
    },
    {
      path: 'gestion_resoluciones',
      canActivate: [NavGuard, RoleGuard],
      children: [
        {
          path: '',
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
          path: 'vincular_docentes',
          component: VincularDocentesComponent,
        },
        {
          path: 'listar_vinculaciones',
          component: ListarVinculacionesComponent,
        },
        {
          path: 'cancelar_vinculaciones',
          component: CancelarVinculacionesComponent,
        },
        {
          path: 'rp_vinculacion',
          component: RpVinculacionesComponent,
        },
      ]
    },
    {
      path: 'gestion_resoluciones/consulta_docente',
      component: ConsultaDocenteComponent,
      canActivate: [NavGuard, RoleGuard],
      runGuardsAndResolvers: 'always'
    },
    {
      path: 'resolucion_administracion',
      component: AdminResolucionesComponent,
      canActivate: [NavGuard, RoleGuard],
      runGuardsAndResolvers: 'always'
    },
    {
      path: 'resolucion_aprobacion',
      component: AprobacionResolucionesComponent,
      canActivate: [NavGuard, RoleGuard],
      runGuardsAndResolvers: 'always'
    },
    {
      path: 'reporte_financiera',
      component: ReporteFinancieraComponent,
      //canActivate: [NavGuard, RoleGuard],
      //runGuardsAndResolvers: 'always'
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

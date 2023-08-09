import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { UtilService } from '../services/utilService';
import { DatosReporte } from 'src/app/@core/models/datos_reporte';
import { first, forkJoin } from 'rxjs';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { NivelFormacion } from 'src/app/@core/models/nivel_formacion';
import { Periodo } from 'src/app/@core/models/periodo';
import { ReporteFinanciera, ReporteFinancieraExcel } from 'src/app/@core/models/reporte_financiera';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-reporte-financiera',
  templateUrl: './reporte-financiera.component.html',
  styleUrls: ['./reporte-financiera.component.scss']
})
export class ReporteFinancieraComponent implements OnInit {

  datosReporte: DatosReporte;
  vigencias: Periodo[];
  niveles: NivelFormacion[];
  facultades: any[];
  reporteFinanciera: ReporteFinanciera[];
  reporteFinancieraCVS: any;

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.popUp.close()
   }

  ngOnInit(): void {
    this.cargarDatos();
    this.limpiarFormulario();
    this.reporteFinancieraCVS = {
      columns: ReporteFinancieraExcel,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      noDataMessage: 'No hay registros en el reporte',
    };
  }

  limpiarFormulario(): void {
    this.datosReporte = new DatosReporte();
    this.datosReporte.Resolucion = '';
  }

  cargarDatos(): void {
    this.popUp.loading();
    forkJoin([
      this.request.get(
        environment.PARAMETROS_SERVICE,
        `periodo?query=CodigoAbreviacion:VG&fields=Year`
      ).pipe(first()),
      this.request.get(
        environment.OIKOS_SERVICE,
        `dependencia_tipo_dependencia?query=TipoDependenciaId.Id:2&limit=0`
      ).pipe(first()),
      this.request.get(
        environment.PROYECTOS_SERVICE,
        `nivel_formacion?limit=0`
      ).pipe(first())
    ]).pipe().subscribe({
      next: ([resp1, resp2, resp3]: [Respuesta, any[], NivelFormacion[],]) => {
        this.vigencias = resp1.Data as Periodo[];
        this.facultades = resp2;
        this.niveles = resp3.filter(nivel => nivel.NivelFormacionPadreId === null);
        this.popUp.close();
      },
      error: () => {
        this.popUp.close();
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
      }
    });
  }

  generarReporte() {
    this.request.post(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `reporte_financiera`,
      this.datosReporte
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.reporteFinanciera = response.Data
          console.log(this.reporteFinanciera)
          this.generarReporteCSV()
        }
      },
      error: (error: any) => {
        this.popUp.close();
        this.popUp.error('No se ha podido guardar la plantilla');
      }
    });
  }

  async generarReporteCSV(): Promise<void> {
    let texto = '';
    Object.keys(this.reporteFinancieraCVS.columns).forEach((col) => {
      texto += this.reporteFinancieraCVS.columns[col].title + ';';
    });
    texto += '\n';
    var i = 0
    this.reporteFinanciera.forEach(async reporte => {
      texto += reporte.Id + ';';
      texto += "'" + reporte.Resolucion + "';";
      texto += reporte.Nombre + ';';
      texto += reporte.Cedula + ';';
      texto += this.datosReporte.Facultad + ';'
      texto += reporte.Facultad + ';';
      texto += reporte.CodigoProyecto + ';';
      texto += reporte.ProyectoCurricular + ';';
      texto += reporte.Horas + ';';
      texto += reporte.Semanas + ';';
      texto += reporte.Cdp + ';';
      texto += formatCurrency(reporte.Total, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.SueldoBasico, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.PrimaNavidad, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.Vacaciones, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.PrimaVacaciones, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.Cesantias, this.locale, '$') + ';' ;
      texto += formatCurrency(reporte.InteresesCesantias, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.PrimaServicios, this.locale, '$') + ';'  ;
      texto += formatCurrency(reporte.BonificacionServicios, this.locale, '$') + '\n'  ;

    });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
    a.download = `reporte_financiera_${this.datosReporte.Resolucion}_${this.datosReporte.Vigencia}.csv`;
    a.click();
  }
}

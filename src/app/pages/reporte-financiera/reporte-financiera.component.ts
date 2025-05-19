import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { UtilService } from '../services/utilService';
import { DatosReporte, DatosReporteAll } from 'src/app/@core/models/datos_reporte';
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

  datosReporte: DatosReporte | DatosReporteAll;
  vigencias: Periodo[];
  niveles: NivelFormacion[];
  facultades: any[];
  reporteFinanciera: ReporteFinanciera[];
  reporteFinancieraCVS: any;
  modoReporte: 'resolucion' | 'consolidado' = 'resolucion';

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.popUp.close();
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
    this.datosReporte = this.modoReporte === 'resolucion'
      ? new DatosReporte()
      : new DatosReporteAll();
  }

  onModoReporteChange(): void {
    this.limpiarFormulario();
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
    ]).subscribe({
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
    const esConsolidado = this.modoReporte === 'consolidado';

    const servicio = esConsolidado
      ? environment.RESOLUCIONES_V2_SERVICE
      : environment.RESOLUCIONES_MID_V2_SERVICE;

    const endpoint = esConsolidado
      ? 'reporte_financiera/all'
      : 'reporte_financiera';

    const payload = this.datosReporte;

    this.request.post(servicio, endpoint, payload).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.reporteFinanciera = response.Data;
          this.generarReporteCSV();
        }
      },
      error: () => {
        this.popUp.close();
        this.popUp.error('No se ha podido generar el reporte');
      }
    });
  }

  async generarReporteCSV(): Promise<void> {
    let texto = '';

    if (this.modoReporte === 'consolidado') {
      const columnas = [
        'Resolucion',
        'Vigencia',
        'Periodo',
        'NivelAcademico',
        'TipoVinculacion',
        'DocumentoDocente',
        'Horas',
        'Semanas',
        'Total',
        'Cdp',
        'Rp',
        'Proyectocurricular',
        'TipoResolucion',
        'Sueldobasico',
        'Primanavidad',
        'Vacaciones',
        'Primavacaciones',
        'Cesantias',
        'Interesescesantias',
        'Primaservicios',
        'Bonificacionservicios'
      ];

      // Header
      columnas.forEach(col => {
        texto += col + ';';
      });
      texto += '\n';

      // Datos
      this.reporteFinanciera.forEach(item => {
        columnas.forEach(col => {
          let val = item[col];
          if (val === null || val === undefined) val = '';
          else if (
            typeof val === 'number' &&
            [
              'Total',
              'Sueldobasico',
              'Primanavidad',
              'Vacaciones',
              'Primavacaciones',
              'Cesantias',
              'Interesescesantias',
              'Primaservicios',
              'Bonificacionservicios',
            ].includes(col)
          ) {
            val = formatCurrency(val, this.locale, '$');
          }
          texto += val + ';';
        });
        texto += '\n';
      });

    } else {
      Object.keys(this.reporteFinancieraCVS.columns).forEach((col) => {
        texto += this.reporteFinancieraCVS.columns[col].title + ';';
      });
      texto += '\n';

      this.reporteFinanciera.forEach(reporte => {
        texto += "'" + reporte.Resolucion + "';";
        texto += reporte.Nombre + ';';
        texto += reporte.Cedula + ';';
        texto += (this.datosReporte as any).Facultad + ';';
        texto += reporte.Facultad + ';';
        texto += reporte.CodigoProyecto + ';';
        texto += reporte.ProyectoCurricular + ';';
        texto += reporte.Horas + ';';
        texto += reporte.Semanas + ';';
        texto += reporte.Cdp + ';';
        texto += formatCurrency(reporte.Total, this.locale, '$') + ';';
        texto += formatCurrency(reporte.SueldoBasico, this.locale, '$') + ';';
        texto += formatCurrency(reporte.PrimaNavidad, this.locale, '$') + ';';
        texto += formatCurrency(reporte.Vacaciones, this.locale, '$') + ';';
        texto += formatCurrency(reporte.PrimaVacaciones, this.locale, '$') + ';';
        texto += formatCurrency(reporte.Cesantias, this.locale, '$') + ';';
        texto += formatCurrency(reporte.InteresesCesantias, this.locale, '$') + ';';
        texto += formatCurrency(reporte.PrimaServicios, this.locale, '$') + ';';
        texto += formatCurrency(reporte.BonificacionServicios, this.locale, '$') + '\n';
      });
    }

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
    const nombreArchivo = this.modoReporte === 'resolucion'
      ? `reporte_financiera_${(this.datosReporte as any).Resolucion}_${this.datosReporte.Vigencia}.csv`
      : `reporte_financiera_consolidado_${this.datosReporte.Vigencia}.csv`;
    a.download = nombreArchivo;
    a.click();
  }



}

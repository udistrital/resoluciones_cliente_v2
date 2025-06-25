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
import * as XLSX from 'xlsx';

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
    const servicio = environment.RESOLUCIONES_MID_V2_SERVICE;
    const endpoint = 'reporte_financiera';
    const payload = this.datosReporte;

    this.request.post(servicio, endpoint, payload).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          let datos = response.Data as ReporteFinanciera[];

          if (this.modoReporte === 'resolucion') {
            const resolucion = (this.datosReporte as DatosReporte).Resolucion;
            datos = datos.filter(d => d.Resolucion === resolucion);
          }

          this.reporteFinanciera = datos;
          this.generarReporteExcel();
        }
      },
      error: () => {
        this.popUp.close();
        this.popUp.error('No se ha podido generar el reporte');
      }
    });
  }




async generarReporteExcel(): Promise<void> {
  const columnas: string[] = [
    'Resolucion',
    'Vigencia',
    'Periodo',
    'NivelAcademico',
    'TipoVinculacion',
    'TipoResolucion',
    'DocumentoDocente',
    'Nombre',
    'Facultad',
    'CodigoProyecto',
    'ProyectoCurricular',
    'Horas',
    'Semanas',
    'Cdp',
    'Rp',
    'Total',
    'Sueldobasico',
    'Primanavidad',
    'Vacaciones',
    'Primavacaciones',
    'Cesantias',
    'Interesescesantias',
    'Primaservicios',
    'Bonificacionservicios',
  ];

  const columnasMoneda = [
    'Total',
    'Sueldobasico',
    'Primanavidad',
    'Vacaciones',
    'Primavacaciones',
    'Cesantias',
    'Interesescesantias',
    'Primaservicios',
    'Bonificacionservicios',
  ];

  const datos: any[] = this.reporteFinanciera.map(item => {
    const fila: any = {};
    columnas.forEach(col => {
      let val = item[col];
      if (val === null || val === undefined) val = '';
      else if (col === 'DocumentoDocente') val = `'${val}`;
      fila[col] = val;
    });
    return fila;
  });

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos, { header: columnas });
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

  // Aplicar formato de moneda a las columnas designadas
  columnasMoneda.forEach((col) => {
    const colIndex = columnas.indexOf(col);
    if (colIndex === -1) return;

    const colLetter = XLSX.utils.encode_col(colIndex);
    for (let row = 0; row < datos.length; row++) {
      const cellAddress = `${colLetter}${row + 2}`; // +2 por encabezado
      const cell = ws[cellAddress];
      if (cell && typeof cell.v === 'number') {
        cell.z = '"$"#,##0.00';
        cell.t = 'n';
      }
    }
  });

  const nombreArchivo = this.modoReporte === 'resolucion'
    ? `reporte_financiera_${(this.datosReporte as any).Resolucion}_${this.datosReporte.Vigencia}.xlsx`
    : `reporte_financiera_consolidado_${this.datosReporte.Vigencia}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
}






}

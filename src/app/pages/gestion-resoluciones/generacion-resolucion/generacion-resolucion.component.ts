import { Component, OnInit } from '@angular/core';
import { Parametro } from 'src/app/@core/models/parametro';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { NivelFormacion } from 'src/app/@core/models/nivel_formacion';
import { Periodo } from 'src/app/@core/models/periodo';
import { LocalDataSource } from 'ng2-smart-table';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';

@Component({
  selector: 'app-generacion-resolucion',
  templateUrl: './generacion-resolucion.component.html',
  styleUrls: ['./generacion-resolucion.component.scss',]
})
export class GeneracionResolucionComponent implements OnInit {

  tiposResoluciones: Parametro[];
  dedicaciones: Parametro[];
  vigencias: Periodo[];
  niveles: NivelFormacion[];
  facultades: any[];
  resolucionesExpedidasSettings: any;
  resolucionesExpedidasData: LocalDataSource;

  tipoResolucion = '';
  Dedicacion = ''
  NumeroResolucion = '';
  nivel = ''
  facultad = 0;
  Semanas = 0;
  Periodo = 0;
  PeridoCarga = 0;
  firmaRector = false;

  constructor(
    private request: RequestManager,
  ) {
    this.initTable()
  }

  initTable(): void {
    this.resolucionesExpedidasSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: false,

    };
    this.resolucionesExpedidasData = new LocalDataSource([
      {
        Id: 1,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Vinculación'
      },
      {
        Id: 2,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Cancelación'
      },
      {
        Id: 3,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Adición'
      },
      {
        Id: 4,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Reducción'
      },
    ]);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.request.get(
      environment.PARAMETROS_SERVICE,
      `parametro?limit=0&query=ParametroPadreid.CodigoAbreviacion:DVE`
    ).subscribe((response: any) => {
      this.dedicaciones = response.Data as Parametro[];
    });

    this.request.get(
      environment.PARAMETROS_SERVICE,
      `parametro?query=TipoParametroId.CodigoAbreviacion:TR`
    ).subscribe((response: any) => {
      this.tiposResoluciones = response.Data.filter((tipo: Parametro) => tipo.ParametroPadreId === null);
    });

    this.request.get(
      environment.PARAMETROS_SERVICE,
      `periodo?query=CodigoAbreviacion:VG&fields=Year`
    ).subscribe((response: any) => {
      this.vigencias = response.Data as Periodo[];
    });

    this.request.get(
      environment.OIKOS_SERVICE,
      `dependencia_tipo_dependencia?query=TipoDependenciaId.Id:2&limit=0`
    ).subscribe((response: any) => {
      this.facultades = response;
    });

    this.request.get(
      environment.PROYECTOS_SERVICE,
      `nivel_formacion?limit=0`
    ).subscribe((response: NivelFormacion[]) => {
      this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null);
    });

    //cargar datos de la tabla
  }

  generarResolucion(): void {

  }

  asociarResolucion(): void {
    
  }

  seleccionarResolucion(event): void {
    console.log(event.data.Id);
  }

}

import { Component, OnInit } from '@angular/core';
import { Parametro } from 'src/app/@core/models/parametro';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { NivelFormacion } from 'src/app/@core/models/nivel_formacion';
import { Periodo } from 'src/app/@core/models/periodo';
import { LocalDataSource } from 'ng2-smart-table';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { ContenidoResolucion } from 'src/app/@core/models/contenido_resolucion';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { UtilService } from '../../services/utilService';
import { Location } from '@angular/common';

@Component({
  selector: 'app-generacion-resolucion',
  templateUrl: './generacion-resolucion.component.html',
  styleUrls: ['./generacion-resolucion.component.scss'],
})
export class GeneracionResolucionComponent implements OnInit {

  tiposResoluciones: Parametro[];
  dedicaciones: Parametro[];
  vigencias: Periodo[];
  niveles: NivelFormacion[];
  facultades: any[];
  resolucionesExpedidasSettings: any;
  resolucionesExpedidasData: LocalDataSource;
  contenidoResolucion: ContenidoResolucion;

  tipoResolucion = '';
  NumeroResolucion = '';
  firmaRector = false;
  periodoAnterior = false;

  constructor(
    private request: RequestManager,
    private location: Location,
    private popUp: UtilService,
  ) { }

  initTable(): void {
    this.resolucionesExpedidasSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: false,
    };
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.limpiarFormulario();
    this.initTable();
  }

  limpiarFormulario(): void {
    this.contenidoResolucion = new ContenidoResolucion();
    this.contenidoResolucion.Resolucion = new Resolucion();
    this.contenidoResolucion.Vinculacion = new ResolucionVinculacionDocente();
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

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_resoluciones/resoluciones_expedidas`
    ).subscribe(response => {
      this.resolucionesExpedidasData = new LocalDataSource(response.Data);
    });
  }

  generarResolucion(): void {
    this.popUp.confirm(
      'Generar resolución',
      '¿Está seguro que desea generar una resolución con la información suministrada?',
      'create'
    ).then(result => {
      if (result.isConfirmed) {
        this.contenidoResolucion.Usuario = localStorage.getItem('user');
        this.contenidoResolucion.Resolucion.DependenciaId = this.contenidoResolucion.Vinculacion.FacultadId;
        this.contenidoResolucion.Resolucion.TipoResolucionId = this.tiposResoluciones.filter(
          (tipo: Parametro) => tipo.CodigoAbreviacion === this.tipoResolucion, this)[0].Id;
        this.contenidoResolucion.Resolucion.DependenciaFirmaId = this.firmaRector ? 7 : this.contenidoResolucion.Resolucion.DependenciaId;
        if (!this.periodoAnterior) {
          this.contenidoResolucion.Resolucion.PeriodoCarga = null;
          this.contenidoResolucion.Resolucion.VigenciaCarga = null;
        }
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones`,
          this.contenidoResolucion
        ).subscribe((response: any) => {
          if (response.Success) {
            if (response.Data !== 0) {
              this.popUp.success('La resolución se ha generado con éxito');
            } else {
              this.popUp.error('No hay plantillas para el tipo de resolución indicada');
            }
            // this.location.back();
          }
        });
      }
    });
  }

  asociarResolucion(): void {
    if (this.contenidoResolucion.ResolucionAnteriorId !== null) {
      this.popUp.confirm(
        'Generar resolución',
        '¿Está seguro que desea generar una resolución con la información suministrada?',
        'create'
      ).then(result => {
        if (result.isConfirmed) {
          this.contenidoResolucion.Usuario = localStorage.getItem('user');
          this.contenidoResolucion.Resolucion.NumeroResolucion = this.NumeroResolucion;
          this.contenidoResolucion.Resolucion.TipoResolucionId = this.tiposResoluciones.filter(
            (tipo: Parametro) => tipo.CodigoAbreviacion === this.tipoResolucion, this)[0].Id;
          this.request.post(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            `gestion_resoluciones`,
            this.contenidoResolucion
          ).subscribe((response: any) => {
            if (response.Success) {
              if (response.Data !== 0) {
                this.popUp.success('La resolución se ha generado con éxito');
              } else {
                this.popUp.error('No hay plantillas para el tipo de resolución indicada');
              }
              // this.location.back();
            }
          });
        }
      });
    } else {
      this.popUp.error('Por favor seleccione una resolución de la tabla.');
    }
  }

  seleccionarResolucion(event): void {
    this.contenidoResolucion.ResolucionAnteriorId = event.data.Id;
  }

}

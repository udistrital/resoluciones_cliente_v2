import { Component, OnInit } from '@angular/core';
import { Parametro } from 'src/app/@core/models/parametro';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { NivelFormacion } from 'src/app/@core/models/nivel_formacion';
import { Periodo } from 'src/app/@core/models/periodo';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { ContenidoResolucion } from 'src/app/@core/models/contenido_resolucion';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { UtilService } from '../../services/utilService';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';

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
  resolucionesExpedidasData: ResolucionesDataSourceComponent;
  contenidoResolucion: ContenidoResolucion;

  tipoResolucion = '';
  NumeroResolucion = '';
  firmaRector = false;
  periodoAnterior = false;

  constructor(
    private request: RequestManager,
    private router: Router,
    private popUp: UtilService,
    private http: HttpClient,
  ) { }

  initTable(): void {
    if (TablaResoluciones.Acciones !== undefined) {
      delete TablaResoluciones.Acciones;
    }
    TablaResoluciones.Estado.filter = false;
    this.resolucionesExpedidasSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
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
      `parametro?limit=0&query=ParametroPadreId.CodigoAbreviacion:DVE`
    ).subscribe((response: Respuesta) => {
      this.dedicaciones = response.Data as Parametro[];
    });

    this.request.get(
      environment.PARAMETROS_SERVICE,
      `parametro?query=TipoParametroId.CodigoAbreviacion:TR`
    ).subscribe((response: Respuesta) => {
      this.tiposResoluciones = response.Data.filter((tipo: Parametro) => tipo.ParametroPadreId === null);
    });

    this.request.get(
      environment.PARAMETROS_SERVICE,
      `periodo?query=CodigoAbreviacion:VG&fields=Year`
    ).subscribe((response: Respuesta) => {
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

    this.resolucionesExpedidasData = new ResolucionesDataSourceComponent(this.http, this.popUp, this.request, 'Estado=Expedida&ExcluirTipo=RCAN', {
      endPoint: `${environment.RESOLUCIONES_MID_V2_SERVICE}gestion_resoluciones`,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      filterFieldKey: '#field#',
      totalKey: 'Total',
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
          this.contenidoResolucion.Resolucion.PeriodoCarga = 0;
          this.contenidoResolucion.Resolucion.VigenciaCarga = 0;
        }
        this.popUp.loading();
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones`,
          this.contenidoResolucion
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              if (response.Data !== 0) {
                this.popUp.close();
                this.popUp.success('La resolución se ha generado con éxito').then(() => {
                  this.router.navigateByUrl('pages/gestion_resoluciones');
                });
              } else {
                this.popUp.close();
                this.popUp.error('No hay plantillas para el tipo de resolución indicada');
              }
            }
          }, error: () => {
            this.popUp.close();
            this.popUp.error('No se ha podido generar la resolución.');
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
          this.popUp.loading();
          this.request.post(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            `gestion_resoluciones`,
            this.contenidoResolucion
          ).subscribe({
            next: (response: Respuesta) => {
              if (response.Success) {
                if (response.Data !== 0) {
                  this.popUp.close();
                  this.popUp.success('La resolución se ha generado con éxito').then(() => {
                    this.router.navigateByUrl('pages/gestion_resoluciones');
                  });
                } else {
                  this.popUp.close();
                  this.popUp.error('No hay plantillas para el tipo de resolución indicada');
                }
              }
            }, error: () => {
              this.popUp.close();
              this.popUp.error('No se ha podido generar la resolución.');
            }
          });
        }
      });
    } else {
      this.popUp.error('Por favor seleccione una resolución de la tabla.');
    }
  }

  seleccionarResolucion(event): void {
    (event.isSelected as boolean)
    ? this.contenidoResolucion.ResolucionAnteriorId = event.data.Id
    : this.contenidoResolucion.ResolucionAnteriorId = null;
  }

}

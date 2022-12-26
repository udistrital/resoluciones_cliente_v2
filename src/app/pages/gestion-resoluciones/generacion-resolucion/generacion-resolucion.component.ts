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
import { Router, ActivatedRoute } from '@angular/router';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { VinculacionTercero } from 'src/app/@core/models/vinculacion_tercero';
import { UserService } from '../../services/userService';
import { first, forkJoin } from 'rxjs';

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
  filtrarFacultad = false;
  dependenciaUsuario = 0;

  constructor(
    private request: RequestManager,
    private router: Router,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private http: HttpClient,
    private userService: UserService,
  ) { }

  initTable(): void {
    if (TablaResoluciones.Acciones !== undefined) {
      delete TablaResoluciones.Acciones;
    }
    TablaResoluciones.Estado.filter = false;
    TablaResoluciones.TipoResolucion.filter = false;
    this.resolucionesExpedidasSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
    };

    const query = `${this.filtrarFacultad?`Facultad=${this.dependenciaUsuario}&`:``}Estado=Expedida&ExcluirTipo=RCAN`;
    this.resolucionesExpedidasData = new ResolucionesDataSourceComponent(this.http, this.popUp, this.request, query, {
      endPoint: `${environment.RESOLUCIONES_MID_V2_SERVICE}gestion_resoluciones`,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      filterFieldKey: '#field#',
      totalKey: 'Total',
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.limpiarFormulario();
    this.initTable();
    this.userService.dependenciaUser$.subscribe((data: VinculacionTercero) => {
      this.dependenciaUsuario = data.DependenciaId?data.DependenciaId:0;
    });
  }

  limpiarFormulario(): void {
    this.contenidoResolucion = new ContenidoResolucion();
    this.contenidoResolucion.Resolucion = new Resolucion();
    this.contenidoResolucion.Vinculacion = new ResolucionVinculacionDocente();
  }

  cargarDatos(): void {
    this.popUp.loading();
    forkJoin([
      this.request.get(
        environment.PARAMETROS_SERVICE,
        `parametro?limit=0&query=ParametroPadreId.CodigoAbreviacion:DVE`
      ).pipe(first()),
      this.request.get(
        environment.PARAMETROS_SERVICE,
        `parametro?query=TipoParametroId.CodigoAbreviacion:TR`
      ).pipe(first()),
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
      next: ([resp1, resp2, resp3, resp4, resp5]: [Respuesta, Respuesta, Respuesta, any[], NivelFormacion[],]) => {
        this.dedicaciones = resp1.Data as Parametro[];
        this.tiposResoluciones = resp2.Data.filter((tipo: Parametro) => tipo.ParametroPadreId === null);
        this.vigencias = resp3.Data as Periodo[];
        this.facultades = resp4;
        this.niveles = resp5.filter(nivel => nivel.NivelFormacionPadreId === null);
        this.popUp.close();
      },
      error: () => {
        this.popUp.close();
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
      }
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
                  this.router.navigate(['../'], {relativeTo: this.route});
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
                    this.router.navigate(['../'], {relativeTo: this.route});
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

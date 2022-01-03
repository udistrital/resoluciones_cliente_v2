import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { ContenidoResolucion } from 'src/app/@core/models/contenido_resolucion';
import { Parametro } from 'src/app/@core/models/parametro';
import { NivelFormacion } from 'src/app/@core/models/nivel_formacion';
import { Articulo } from 'src/app/@core/models/articulo';
import { ComponenteResolucion } from 'src/app/@core/models/componente_resolucion';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { CuadroResponsabilidades } from 'src/app/@core/models/cuadro_responsabilidades';
import { UtilService } from '../services/utilService';

@Component({
  selector: 'app-form-detalle-resolucion',
  templateUrl: './form-detalle-resolucion.component.html',
  styleUrls: ['./form-detalle-resolucion.component.scss'],
})
export class FormDetalleResolucionComponent implements OnInit, OnChanges {

  contenidoResolucion: ContenidoResolucion;
  responsabilidadesSettings: any;
  responsabilidadesData: LocalDataSource;
  niveles: NivelFormacion[];
  dedicaciones: Parametro[];
  facultades: any[];
  tiposResoluciones: Parametro[];
  edicion = false;

  @Input()
  resolucionId: number;

  @Input()
  esPlantilla = false;

  @Output()
  volver = new EventEmitter<void>();

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    switch (changes.resolucionId.currentValue) {
      case 0:
      case undefined:
        this.limpiarFormulario();
        break;
      default:
        this.cargarContenidoResolucion(changes.resolucionId.currentValue);
        break;
    }
  }

  initTable(): void {
    this.responsabilidadesSettings = {
      columns: {
        Funcion: {
          title: 'Función',
          width: '20%',
        },
        Nombre: {
          title: 'Nombre',
          width: '35%',
        },
        Cargo: {
          title: 'Cargo',
          width: '30%',
        },
      },
      actions: {
        position: 'right',
      },
      add: {
        addButtonContent: '<i class="material-icons title="Agregar">add_circle_outline</i>',
        createButtonContent: '<i class="material-icons" title="Guardar">done</i>',
        cancelButtonContent: '<i class="material-icons" title="Cancelar">close</i>',
      },
      edit: {
        editButtonContent: '<i class="material-icons" title="Editar">edit</i>',
        saveButtonContent: '<i class="material-icons" title="Guardar">done</i>',
        cancelButtonContent: '<i class="material-icons" title="Cancelar">close</i>',
      },
      delete: {
        deleteButtonContent: '<i class="material-icons" title="Eliminar">delete</i>',
      },
      noDataMessage: 'No hay información de responsabilidades',
    };
    this.responsabilidadesData = new LocalDataSource();
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
  }

  cargarContenidoResolucion(Id: number): void {
    this.esPlantilla ?
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_plantillas/${Id}`
      ).subscribe((response: any) => {
        this.contenidoResolucion = response.Data as ContenidoResolucion;
        const responsabilidades: CuadroResponsabilidades[] = JSON.parse(this.contenidoResolucion.Resolucion.CuadroResponsabilidades);
        this.responsabilidadesData = new LocalDataSource(responsabilidades);
        this.edicion = true;
      }) :
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_resoluciones/${Id}`
      ).subscribe((response: any) => {
        this.contenidoResolucion = response.Data as ContenidoResolucion;
        const responsabilidades: CuadroResponsabilidades[] = JSON.parse(this.contenidoResolucion.Resolucion.CuadroResponsabilidades);
        this.responsabilidadesData = new LocalDataSource(responsabilidades);
        this.edicion = true;
      });
  }

  agregarArticulo(): void {
    const articulo = new Articulo();
    articulo.Articulo = new ComponenteResolucion();
    articulo.Paragrafos = new Array();
    this.contenidoResolucion.Articulos.push(articulo);
  }

  eliminarArticulo(a: number): void {
    this.contenidoResolucion.Articulos.splice(a, 1);
  }

  agregarParagrafo(i: number): void {
    const paragrafo = new ComponenteResolucion();
    this.contenidoResolucion.Articulos[i].Paragrafos.push(paragrafo);
  }

  eliminarParagrafo(i: number, j: number): void {
    this.contenidoResolucion.Articulos[i].Paragrafos.splice(j, 1);
  }

  guardarCambios(): void {
    this.edicion ?
    this.popUp.confirm(
      'Actualizar plantilla',
      '¿Está seguro que desea actualizar la plantilla?',
      'update',
    ).then(result => {
      if (result.isConfirmed) {
        this.responsabilidadesData.getAll().then((data: CuadroResponsabilidades) => {
          this.contenidoResolucion.Resolucion.CuadroResponsabilidades = JSON.stringify(data);
          this.request.put(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            `gestion_plantillas`,
            this.contenidoResolucion,
            this.contenidoResolucion.Resolucion.Id
          ).subscribe((response: any) => {
            if (response.Success) {
              this.popUp.success('La plantilla se ha actualizado con éxito');
            }
          }, (error: any) => {
            this.popUp.error('No se ha podido actualizar la plantilla');
          });
        });
      }
    }) :
    this.popUp.confirm(
      'Guardar plantilla',
      '¿Está seguro que desea guardar la plantilla?',
      'create',
    ).then(result => {
      if (result.isConfirmed) {
        this.responsabilidadesData.getAll().then((data: CuadroResponsabilidades) => {
          this.contenidoResolucion.Resolucion.CuadroResponsabilidades = JSON.stringify(data);
          this.request.post(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            `gestion_plantillas`,
            this.contenidoResolucion
          ).subscribe((response: any) => {
            if (response.Success) {
              this.popUp.success('La plantilla se ha guardado con éxito');
            }
          }, (error: any) => {
            console.log(error);
            this.popUp.error('No se ha podido guardar la plantilla');
          });
        });
      }
    });
  }

  generarVistaPrevia(): void {}

  limpiarFormulario(): void {
    this.contenidoResolucion = new ContenidoResolucion();
    this.contenidoResolucion.Articulos = new Array();
    this.contenidoResolucion.Resolucion = new Resolucion();
    this.contenidoResolucion.Vinculacion = new ResolucionVinculacionDocente();
    const articulo = new Articulo();
    articulo.Articulo = new ComponenteResolucion();
    articulo.Paragrafos = new Array();
    this.contenidoResolucion.Articulos.push(articulo);
    this.responsabilidadesData = new LocalDataSource();
    this.edicion = false;
  }

  salir(): void {
    this.limpiarFormulario();
    this.volver.emit();
  }

}

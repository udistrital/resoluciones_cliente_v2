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
import { Respuesta } from 'src/app/@core/models/respuesta';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalDocumentoViewerComponent } from '../modal-documento-viewer/modal-documento-viewer.component';

@Component({
  selector: 'app-form-detalle-resolucion',
  templateUrl: './form-detalle-resolucion.component.html',
  styleUrls: ['./form-detalle-resolucion.component.scss'],
})
export class FormDetalleResolucionComponent implements OnInit, OnChanges {

  dialogConfig: MatDialogConfig;
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
    private dialog: MatDialog,
  ) {
    this.initTable();
    this.limpiarFormulario();
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = '';
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
          title: 'Funci??n',
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
      noDataMessage: 'No hay informaci??n de responsabilidades',
    };
    this.responsabilidadesData = new LocalDataSource();
  }

  cargarDatos(): void {
    this.request.get(
      environment.PARAMETROS_SERVICE,
      `parametro?limit=0&query=ParametroPadreid.CodigoAbreviacion:DVE`
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

  async cargarContenidoResolucion(Id: number): Promise<void> {
    this.popUp.loading();
    return new Promise<void>(resolve => {
      this.esPlantilla ?
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_plantillas/${Id}`
        ).subscribe((response: Respuesta) => {
          this.contenidoResolucion = response.Data as ContenidoResolucion;
          const responsabilidades: CuadroResponsabilidades[] = JSON.parse(this.contenidoResolucion.Resolucion.CuadroResponsabilidades || '[]');
          this.responsabilidadesData = new LocalDataSource(responsabilidades);
          this.edicion = true;
          this.popUp.close();
          resolve();
        }) :
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones/${Id}`
        ).subscribe((response: Respuesta) => {
          this.contenidoResolucion = response.Data as ContenidoResolucion;
          const responsabilidades: CuadroResponsabilidades[] = JSON.parse(this.contenidoResolucion.Resolucion.CuadroResponsabilidades || '[]');
          this.responsabilidadesData = new LocalDataSource(responsabilidades);
          this.edicion = true;
          this.popUp.close();
          resolve();
        });
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

  async guardarCambios(): Promise<void> {
    return new Promise<void>(resolve => {
      this.esPlantilla ?
        this.edicion ?
        this.popUp.confirm(
          'Actualizar plantilla',
          '??Est?? seguro que desea actualizar la plantilla?',
          'update',
        ).then(result => {
          if (result.isConfirmed) {
            this.responsabilidadesData.getAll().then((data: CuadroResponsabilidades) => {
              this.contenidoResolucion.Resolucion.CuadroResponsabilidades = JSON.stringify(data);
              this.popUp.loading();
              this.request.put(
                environment.RESOLUCIONES_MID_V2_SERVICE,
                `gestion_plantillas`,
                this.contenidoResolucion,
                this.contenidoResolucion.Resolucion.Id
              ).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    this.popUp.close();
                    this.popUp.success('La plantilla se ha actualizado con ??xito').then(() => {
                      this.cargarContenidoResolucion(this.contenidoResolucion.Resolucion.Id).then(() => {
                        resolve();
                      });
                    });
                  }
                },
                error: (error: any) => {
                  this.popUp.close();
                  this.popUp.error('No se ha podido actualizar la plantilla');
                }
              });
            });
          }
        }) :
        this.popUp.confirm(
          'Guardar plantilla',
          '??Est?? seguro que desea guardar la plantilla?',
          'create',
        ).then(result => {
          if (result.isConfirmed) {
            this.responsabilidadesData.getAll().then((data: CuadroResponsabilidades) => {
              this.contenidoResolucion.Resolucion.CuadroResponsabilidades = JSON.stringify(data);
              this.popUp.loading();
              this.request.post(
                environment.RESOLUCIONES_MID_V2_SERVICE,
                `gestion_plantillas`,
                this.contenidoResolucion
              ).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    this.contenidoResolucion.Resolucion.Id = response.Data;
                    this.popUp.close();
                    this.popUp.success('La plantilla se ha guardado con ??xito').then(() => {
                      this.cargarContenidoResolucion(this.contenidoResolucion.Resolucion.Id).then(() => {
                        resolve();
                      });
                    });
                  }
                },
                error: (error: any) => {
                  this.popUp.close();
                  this.popUp.error('No se ha podido guardar la plantilla');
                }
              });
            });
          }
        }) :
      this.popUp.confirm(
        'Actualizar resoluci??n',
        '??Est?? seguro que desea actualizar la resoluci??n?',
        'update'
      ).then(result => {
        if (result.isConfirmed) {
          this.responsabilidadesData.getAll().then((data: CuadroResponsabilidades) => {
            this.contenidoResolucion.Resolucion.CuadroResponsabilidades = JSON.stringify(data);
            this.popUp.loading();
            this.request.put(
              environment.RESOLUCIONES_MID_V2_SERVICE,
              `gestion_resoluciones`,
              this.contenidoResolucion,
              this.contenidoResolucion.Resolucion.Id
            ).subscribe({
              next: (response: Respuesta) => {
                if (response.Success) {
                  this.popUp.close();
                  this.popUp.success('La resoluci??n se ha actualizado con ??xito').then(() => {
                    this.cargarContenidoResolucion(this.contenidoResolucion.Resolucion.Id).then(() => {
                      resolve();
                    });
                  });
                }
              }, error: () => {
                this.popUp.close();
                this.popUp.error('No se ha podido actualizar la resoluci??n');
              }
            });
          });
        }
      });
    });
  }

  generarVistaPrevia(): void {
    this.popUp.confirm(
      'Guardar cambios',
      'Para mostrar el documento debe guardar los cambios realizados',
      'update'
    ).then(result => {
      if (result.isConfirmed) {
        this.guardarCambios().then(() => {
          this.popUp.loading();
          this.request.get(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            `gestion_resoluciones/generar_resolucion/${this.contenidoResolucion.Resolucion.Id}`
          ).subscribe({
            next: (response: Respuesta) => {
              if (response.Success) {
                this.popUp.close();
                this.dialogConfig.data = response.Data as string;
                this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
              }
            }, error: () => {
              this.popUp.close();
              this.popUp.error('No se ha podido generar el documento.');
            }
          });
        });
      }
    });
  }

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

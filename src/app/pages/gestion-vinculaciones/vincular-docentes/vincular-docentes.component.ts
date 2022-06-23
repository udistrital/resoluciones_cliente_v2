import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { ModalDisponibilidadComponent } from '../modal-disponibilidad/modal-disponibilidad.component';
import { ModalDocumentoViewerComponent } from '../../modal-documento-viewer/modal-documento-viewer.component';
import { CargaLectiva } from 'src/app/@core/models/carga_lectiva';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { first, forkJoin } from 'rxjs';

@Component({
  selector: 'app-vincular-docentes',
  templateUrl: './vincular-docentes.component.html',
  styleUrls: ['./vincular-docentes.component.scss']
})
export class VincularDocentesComponent implements OnInit {

  dialogConfig: MatDialogConfig;
  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  cargaAcademicaSettings: any;
  cargaAcademicaData: LocalDataSource;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  docentesSeleccionados: CargaLectiva[];
  vinculacionesSeleccionadas: Vinculaciones[];

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private dialog: MatDialog,
  ) {
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.cargaAcademicaData = new LocalDataSource();
    this.vinculacionesData = new LocalDataSource();
    this.docentesSeleccionados = [];
    this.vinculacionesSeleccionadas = [];
    this.initTables();
    this.preloadData();
  }

  preloadData(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        forkJoin<[Respuesta, Respuesta]>([
          this.request.get(
            environment.RESOLUCIONES_V2_SERVICE,
            `resolucion/${this.resolucionId}`
          ).pipe(first()),
          this.request.get(
            environment.RESOLUCIONES_V2_SERVICE,
            `resolucion_vinculacion_docente/${this.resolucionId}`
          ).pipe(first())
        ]).pipe().subscribe({
          next: ([res, vinc]: [Respuesta, Respuesta]) => {
            this.resolucion = res.Data as Resolucion;
            this.resolucionVinculacion = vinc.Data as ResolucionVinculacionDocente;
            this.obtenerCargaAcademica();
          },
          error: () => {
            this.popUp.error('Ha ocurrido un error, comuniquese con el area de soporte.');
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = {};
  }

  obtenerCargaAcademica(): void {
    this.popUp.loading();
    const params = `/${this.resolucion.VigenciaCarga}/${this.resolucion.PeriodoCarga}/${this.resolucionVinculacion.Dedicacion}/${this.resolucionVinculacion.FacultadId}/${this.resolucionVinculacion.NivelAcademico}`;
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/docentes_carga_horaria${params}`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Data !== null) {
          this.cargaAcademicaData.load(response.Data);
          this.popUp.close();
          this.cargarVinculaciones();
        } else {
          this.popUp.close();
          this.popUp.warning('No se encontraron datos de carga académica');
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('Ha ocurrido un error, comuniquese con el area de soporte.');
      }
    });
  }

  cargarVinculaciones(): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/${this.resolucionId}`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.vinculacionesData.load(response.Data);
        }
      }, error: () => {
        this.popUp.error('Ha ocurrido un error, comuniquese con el area de soporte.');
      }
    });
  }

  initTables(): void {
    this.cargaAcademicaSettings = {
      columns: {
        docente_apellido: {
          title: 'Apellidos',
          width: '15%',
          editable: false,
        },
        docente_nombre: {
          title: 'Nombres',
          width: '15%',
          editable: false,
        },
        docente_documento: {
          title: 'Documento',
          width: '10%',
          editable: false,
        },
        horas_lectivas: {
          title: 'Horas',
          width: '5%',
          editable: true,
        },
        proyecto_nombre: {
          title: 'Proyecto Curricular',
          width: '25%',
          editable: false,
        },
        CategoriaNombre: {
          title: 'Categoria',
          width: '10%',
          editable: false,
        },
        tipo_vinculacion_nombre: {
          title: 'Dedicación',
          width: '10%',
          editable: false,
        },
      },
      actions: {
        position: 'right',
        columnTitle: 'Acciones',
        add: false,
        delete: false,
      },
      edit: {
        editButtonContent: '<em class="material-icons" title="Editar">edit</em>',
        saveButtonContent: '<em class="material-icons" title="Guardar">check</em>',
        cancelButtonContent: '<em class="material-icons" title="Cancelar">close</em>'
      },
      selectMode: 'multi',
      switchPageToSelectedRowPage: true,
      mode: 'internal',
      noDataMessage: 'No se ha cargado la información de carga académica',
    };

    this.vinculacionesSettings = {
      columns: TablaVinculaciones,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      hideSubHeader: true,
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
  }

  abrirModalDisponibilidad(): void {
    const previnculaciones = {
      Docentes: this.docentesSeleccionados,
      ResolucionData: this.resolucionVinculacion,
      NumeroSemanas: this.resolucion.NumeroSemanas,
      Vigencia: this.resolucion.Vigencia,
      Disponibilidad: []
    };
    this.request.post(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      'gestion_vinculaciones/calcular_valor_contratos_seleccionados',
      previnculaciones
    ).subscribe((response: Respuesta) => {
      this.dialogConfig.data = {
        vigencia: this.resolucion.Vigencia,
        total: response.Data as string
      };
      const dialog = this.dialog.open(ModalDisponibilidadComponent, this.dialogConfig);
      dialog.afterClosed().subscribe((disponibilidad: DocumentoPresupuestal[]) => {
        if (disponibilidad) {
          previnculaciones.Disponibilidad = disponibilidad;
          this.popUp.loading();
          this.request.post(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            'gestion_vinculaciones',
            previnculaciones
          ).subscribe({
            next: (response2: Respuesta) => {
              if (response2.Success) {
                this.popUp.close();
                this.popUp.success(response2.Message).then(() => {
                  this.cargarVinculaciones();
                });
              }
            }, error: () => {
              this.popUp.close();
              this.popUp.error('Los docentes seleccionados ya se encuentran contratados');
            }
          });
        }
      });
    });
  }

  generarInformeCSV(): void {
    let texto = '';
    Object.keys(this.vinculacionesSettings.columns).forEach((col) => {
      texto += this.vinculacionesSettings.columns[col].title + ';';
    });
    texto += '\n';
    this.vinculacionesData.getAll().then((vinculaciones: Vinculaciones[]) => {
      vinculaciones.forEach(v => {
        texto += v.Id + ';';
        texto += v.Nombre + ';';
        texto += v.PersonaId + ';';
        texto += v.Categoria + ';';
        texto += v.Dedicacion + ';';
        texto += v.NumeroHorasSemanales + ';';
        texto += v.NumeroSemanas + ';';
        texto += v.Disponibilidad + ';';
        texto += v.ValorContratoFormato + '\n';
      });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
      a.download = 'precontratados.csv';
      a.click();
    });
  }

  generarInformePDF(): void {
    this.vinculacionesData.getAll().then((vinculaciones: Vinculaciones[]) => {
      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/informe_vinculaciones`,
        vinculaciones
      ).subscribe((response: Respuesta) => {
        if (response.Success) {
          this.dialogConfig.data = response.Data as string;
          this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
        }
      });
    });
  }

  desvincular(): void {
    this.popUp.confirm(
      'Cancelar vinculaciones',
      '¿Desea confirmar la desvinculación de los docentes seleccionados?',
      'delete'
    ).then(result => {
      if (result.isConfirmed) {
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          'gestion_vinculaciones/desvincular_docentes',
          this.vinculacionesSeleccionadas
        ).subscribe((response: Respuesta) => {
          if (response.Success) {
            this.popUp.success('Las vinculaciones han sido eliminadas').then(() => {
              this.cargarVinculaciones();
            });
          }
        });
      }
    });
  }

  seleccionarDocentes(event): void {
    this.docentesSeleccionados = event.selected;
  }

  seleccionarVinculaciones(event): void {
    this.vinculacionesSeleccionadas = event.selected;
  }

}

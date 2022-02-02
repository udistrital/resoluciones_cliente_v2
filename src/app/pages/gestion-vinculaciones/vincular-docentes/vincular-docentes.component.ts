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
  docentesSeleccionados: any[];
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
        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `resolucion/${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          this.resolucion = response.Data as Resolucion;
        });
        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `resolucion_vinculacion_docente/${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          this.resolucionVinculacion = response.Data as ResolucionVinculacionDocente;
        });
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      const params = `/${this.resolucion.Vigencia}/${this.resolucion.Periodo}/${this.resolucionVinculacion.Dedicacion}/${this.resolucionVinculacion.FacultadId}/${this.resolucionVinculacion.NivelAcademico}`;
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/docentes_carga_horaria${params}`
      ).subscribe((response: Respuesta) => {
        if (response.Data !== null) {
          this.cargaAcademicaData.load(response.Data);
        } else {
          this.popUp.error('No se encontraron datos de carga académica');
        }
      });
      this.cargarVinculaciones();
    }, 200);
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = {};
  }

  cargarVinculaciones(): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/${this.resolucionId}`
    ).subscribe((response: Respuesta) => {
      if (response.Success) {
        this.vinculacionesData.load(response.Data);
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
        Emerito: {
          title: 'Emérito',
          width: '5%',
          editor: {
            type: 'checkbox',
            config: {
              true: true,
              false: false,
            },
          },
          valuePrepareFunction: (value) => {
            return value ? 'Si': 'No';
          },
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
      mode: 'internal'
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
    const dialog = this.dialog.open(ModalDisponibilidadComponent, this.dialogConfig);
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (ok) {

      }
    })

  }

  generarInformeCSV(): void {
    var texto = '';
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

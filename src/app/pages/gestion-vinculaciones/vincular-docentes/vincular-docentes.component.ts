import { Component, OnInit, LOCALE_ID, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LocalDataSource, Ng2SmartTableComponent } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones, TablaVinculacionesExcel, TablaVinculacionesExcelHCH } from 'src/app/@core/models/tabla_vinculaciones';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { ModalDisponibilidadComponent } from '../modal-disponibilidad/modal-disponibilidad.component';
import { ModalDocumentoViewerComponent } from '../../modal-documento-viewer/modal-documento-viewer.component';
import { CargaLectiva } from 'src/app/@core/models/carga_lectiva';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { first, forkJoin } from 'rxjs';
import { Parametro } from 'src/app/@core/models/parametro';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-vincular-docentes',
  templateUrl: './vincular-docentes.component.html',
  styleUrls: ['./vincular-docentes.component.scss']
})
export class VincularDocentesComponent implements OnInit {

  @ViewChild('table') smartTable: Ng2SmartTableComponent;
  selectedRow: any;
  dialogConfig: MatDialogConfig;
  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  cargaAcademicaSettings: any;
  cargaAcademicaData: LocalDataSource;
  vinculacionesSettings: any;
  vinculacionesSettingsCSV: any;
  vinculacionesSettingsCSVHCH: any;
  vinculacionesData: LocalDataSource;
  docSeleccionadosAux: CargaLectiva;
  idSeleccionados: number[];
  docentesSeleccionados: CargaLectiva[];
  vinculacionesSeleccionadas: Vinculaciones[];
  tipoResolucion: Parametro;
  userClick: boolean;

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private dialog: MatDialog,
  ) {
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.tipoResolucion = new Parametro();
    this.cargaAcademicaData = new LocalDataSource();
    this.vinculacionesData = new LocalDataSource();
    this.docentesSeleccionados = [];
    this.vinculacionesSeleccionadas = [];
    this.idSeleccionados = [];
    this.initTables();
    this.preloadData();
    this.userClick = true;

    this.cargaAcademicaData.onChanged().subscribe(change => {
      switch (change.action) {
        case 'page':
          this.seleccionarDocentesCambioTabla(change);
          break;
      }
    });
  }

  get seleccionCount(): number {
    try {
      return this.smartTable?.grid?.getSelectedRows?.().length || 0;
    } catch {
      return 0;
    }
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
            if (this.resolucionVinculacion.NivelAcademico !== 'POSGRADO') {
              const tablaCarga = this.cargaAcademicaSettings;
              tablaCarga.columns.horas_lectivas.editable = false;
              tablaCarga.edit = false;
              tablaCarga.actions = false;
              this.cargaAcademicaSettings = { ...tablaCarga };
            }
            this.request.get(
              environment.PARAMETROS_SERVICE,
              `parametro/${this.resolucion.TipoResolucionId}`
            ).subscribe({
              next: (response: Respuesta) => {
                this.tipoResolucion = response.Data as Parametro;
              }, error: () => {
                this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
              }
            });
            this.obtenerCargaAcademica();
          },
          error: () => {
            this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
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
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
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
          this.docentesSeleccionados = [];
          this.idSeleccionados = [];
          const vinculaciones = response.Data as Vinculaciones[];
          this.vinculacionesData.load(vinculaciones);
          this.cargaAcademicaData.getAll().then((carga: CargaLectiva[]) => {
            const contratados = carga.filter((reg: CargaLectiva) => {
              let encontrado = false;
              vinculaciones.forEach(vinc => {
                encontrado ||= (reg.docente_documento === vinc.PersonaId.toString() && reg.id_proyecto === vinc.ProyectoCurricularId.toString());
              });
              return encontrado;
            });
            contratados.forEach((reg2: CargaLectiva) => {
              this.cargaAcademicaData.remove(reg2);
            });
          });
        }
      }, error: () => {
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
      }
    });
  }

  initTables(): void {
    this.cargaAcademicaSettings = {
      columns: {
        docente_apellido: { title: 'Apellidos', width: '15%', editable: false },
        docente_nombre: { title: 'Nombres', width: '15%', editable: false },
        docente_documento: { title: 'Documento', width: '10%', editable: false },
        horas_lectivas: { title: 'Horas', width: '5%', editable: true },
        proyecto_nombre: { title: 'Proyecto Curricular', width: '25%', editable: false },
        CategoriaNombre: { title: 'Categoria', width: '10%', editable: false },
        tipo_vinculacion_nombre: { title: 'Dedicación', width: '10%', editable: false },
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
      pager: { display: true },
      selectMode: 'multi',
      mode: 'internal',
      noDataMessage: 'No se ha cargado la información de carga académica',
    };

    this.vinculacionesSettings = {
      columns: TablaVinculaciones,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };

    this.vinculacionesSettingsCSV = {
      columns: TablaVinculacionesExcel,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };

    this.vinculacionesSettingsCSVHCH = {
      columns: TablaVinculacionesExcelHCH,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
  }

  abrirModalDisponibilidad(): void {
    const selected = this.smartTable?.grid?.getSelectedRows?.() || [];
    this.docentesSeleccionados = selected.map((r: any) => r.getData ? r.getData() : r);

    if (!this.docentesSeleccionados.length) {
      this.popUp.warning('Debes seleccionar al menos un docente.');
      return;
    }

    let puedeContratar = true;
    this.docentesSeleccionados.forEach((docente: CargaLectiva) => {
      puedeContratar = puedeContratar && docente.CategoriaNombre !== '';
    });

    if (!puedeContratar) {
      this.popUp.warning('Debe seleccionar docentes con categoría.');
      return;
    }

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

  async generarInformeCSV(): Promise<void> {
    let texto = '';
    if (this.resolucionVinculacion.Dedicacion != "HCH") {
      Object.keys(this.vinculacionesSettingsCSV.columns).forEach((col) => {
        texto += this.vinculacionesSettingsCSV.columns[col].title + ';';
      });
    } else {
      Object.keys(this.vinculacionesSettingsCSVHCH.columns).forEach((col) => {
        texto += this.vinculacionesSettingsCSVHCH.columns[col].title + ';';
      });
    }
    texto += '\n';
    this.vinculacionesData.getAll().then((vinculaciones: Vinculaciones[]) => {
      var i = 0
      vinculaciones.forEach(async v => {
        var textoAux = await this.desagregadoCSV(v)
        texto += textoAux
        i += 1
        if (i == vinculaciones.length) {
          const a = document.createElement('a');
          a.href = window.URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
          a.download = 'precontratados.csv';
          a.click();
        }
      });
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

  seleccionarDocentesCambioTabla(event): void {
    this.userClick = false;
    setTimeout(() => {
      this.docentesSeleccionados.forEach(docSel => {
        if (event.elements.includes(docSel)) {
          const idAux = event.elements.indexOf(docSel);
          const selectedElement: Element = document.querySelectorAll('ng2-smart-table table tbody tr').item(idAux);
          if (selectedElement) {
            const row: HTMLElement = selectedElement.querySelector('td') as HTMLElement;
            row.click();
            this.selectedRow = this.smartTable.grid.getSelectedRows().length;
          }
        }
      });
      this.userClick = true;
    }, 500);
  }

  seleccionarDocentes(event): void {
    this.docSeleccionadosAux = event.data as CargaLectiva;
    const id = event.source.data.indexOf(event.data);
    if ((this.idSeleccionados).includes(id) && this.userClick) {
      const startIndex = this.idSeleccionados.indexOf(id);
      this.idSeleccionados.splice(startIndex, 1);
      this.docentesSeleccionados.splice(startIndex, 1)
    } else if (!(this.idSeleccionados).includes(id) && this.userClick) {
      this.idSeleccionados.push(id)
      this.docentesSeleccionados.push(this.docSeleccionadosAux)
    }
  }

  seleccionarVinculaciones(event): void {
    this.vinculacionesSeleccionadas = event.selected as Vinculaciones[];
  }

  async desagregadoCSV (v: Vinculaciones){
    var texto = ''
    return new Promise(resolve => {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `disponibilidad_vinculacion?query=Activo:true,VinculacionDocenteId.Id:${v.Id}`
      ).subscribe(
        response => {
          texto += v.Id + ';';
          texto += v.Nombre + ';';
          texto += v.PersonaId + ';';
          texto += v.Categoria + ';';
          texto += v.Dedicacion + ';';
          texto += v.NumeroHorasSemanales + ';';
          texto += v.NumeroSemanas + ';';
          texto += v.Disponibilidad + ';';
          if (this.resolucionVinculacion.Dedicacion == "HCH") {
            var aux = response.Data.filter(x => x.Rubro == "SueldoBasico")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + '\n'
            resolve(texto)
          } else {
            texto += v.ValorContratoFormato + ';';
            var aux = response.Data.filter(x => x.Rubro == "PrimaNavidad")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            var aux = response.Data.filter(x => x.Rubro == "PrimaServicios")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            aux = response.Data.filter(x => x.Rubro == "PrimaVacaciones")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            aux = response.Data.filter(x => x.Rubro == "Vacaciones")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            aux = response.Data.filter(x => x.Rubro == "Cesantias")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            aux = response.Data.filter(x => x.Rubro == "InteresesCesantias")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            aux = response.Data.filter(x => x.Rubro == "SueldoBasico")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + ';';
            aux = response.Data.filter(x => x.Rubro == "BonificacionServicios")
            texto += formatCurrency(aux[0].Valor, this.locale, '$') + '\n';
            resolve(texto)
          }
        }
      )
    })
  }
}

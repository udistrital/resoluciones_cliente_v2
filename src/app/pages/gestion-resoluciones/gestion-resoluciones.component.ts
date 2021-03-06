import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { ActionsAssistanceComponent } from 'src/app/@core/components/actions-assistance/actions-assistance.component';
import { environment } from 'src/environments/environment';
import { ModalDocumentoViewerComponent } from '../modal-documento-viewer/modal-documento-viewer.component';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Resolucion } from 'src/app/@core/models/resolucion';

@Component({
  selector: 'app-gestion-resoluciones',
  templateUrl: './gestion-resoluciones.component.html',
  styleUrls: [
    './gestion-resoluciones.component.scss',
    '../form-detalle-resolucion/form-detalle-resolucion.component.scss',
  ]
})
export class GestionResolucionesComponent implements OnInit {

  dialogConfig: MatDialogConfig;
  resolucionesSettings: any;
  resolucionesData: ResolucionesDataSourceComponent;

  icono: string;

  parametros = '';
  query = 'query=Activo:true';
  cadenaFiltro: string[] = [];

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.resolucionesData = new ResolucionesDataSourceComponent(this.http, this.popUp, this.request, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/resoluciones_inscritas?` + this.query + this.parametros,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = '';
  }

  initTable(): void {
    TablaResoluciones['Acciones'] = {
      title: 'Acciones',
      editable: true,
      filter: false,
      width: '4%',
      type: 'custom',
      renderComponent: ActionsAssistanceComponent,
      onComponentInitFunction: (instance: ActionsAssistanceComponent) => {
        instance.modulo = 'gestion';
        instance.icon.subscribe((res: string) => {
          this.icono = res;
        });
        instance.data.subscribe((data: Resoluciones) => {
          this.eventHandler(this.icono, data);
        });
      },
    };

    this.resolucionesSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
      noDataMessage: 'No hay resoluciones registradas en el sistema',
    };
  }

  eventHandler(event: string, rowData: Resoluciones): void {
    switch (event) {
      case 'documento':
        this.cargarDocumento(rowData);
        break;
      case 'editar':
        this.editarResoluci??n(rowData.Id);
        break;
      case 'anular':
        this.anularResoluci??n(rowData.Id);
        break;
      case 'consultar':
        this.consultarVinculacionesResoluci??n(rowData.Id);
        break;
      case 'vincular':
        this.vincularDocentesResoluci??n(rowData.Id);
        break;
      case 'cancelar':
        this.cancelarDocentesResoluci??n(rowData.Id);
        break;
      case 'enviar':
        this.enviarRevision(rowData.Id);
        break;
      case 'adicionar':
        this.adicionarHorasDocentesResoluci??n(rowData.Id);
        break;
      case 'reducir':
        this.reducirHorasDocentesResoluci??n(rowData.Id);
        break;
    }
  }

  filtroTabla(): void {
    this.query = 'query=Activo:true';
    this.parametros = '';
    if (this.cadenaFiltro[0] !== undefined && this.cadenaFiltro[0] !== '') {
      this.query = this.query.concat(',NumeroResolucion:' + this.cadenaFiltro[0]);
    }
    if (this.cadenaFiltro[1] !== undefined && this.cadenaFiltro[1] !== '') {
      this.query = this.query.concat(',Vigencia:' + this.cadenaFiltro[1]);
    }
    if (this.cadenaFiltro[2] !== undefined && this.cadenaFiltro[2] !== '') {
      this.query = this.query.concat(',Periodo=' + this.cadenaFiltro[2]);
    }
    if (this.cadenaFiltro[3] !== undefined && this.cadenaFiltro[3] !== '') {
      this.parametros = this.parametros.concat('&facultad=' + this.cadenaFiltro[3]);
    }
    if (this.cadenaFiltro[4] !== undefined && this.cadenaFiltro[4] !== '') {
      this.parametros = this.parametros.concat('&nivelA=' + this.cadenaFiltro[4]);
    }
    if (this.cadenaFiltro[5] !== undefined && this.cadenaFiltro[5] !== '') {
      this.parametros = this.parametros.concat('&dedicacion=' + this.cadenaFiltro[5]);
    }
    if (this.cadenaFiltro[6] !== undefined && this.cadenaFiltro[6] !== '') {
      this.query = this.query.concat(',NumeroSemanas=' + this.cadenaFiltro[6]);
    }
    if (this.cadenaFiltro[7] !== undefined && this.cadenaFiltro[7] !== '') {
      this.parametros = this.parametros.concat('&estadoRes=' + this.cadenaFiltro[7]);
    }
    if (this.cadenaFiltro[8] !== undefined && this.cadenaFiltro[8] !== '') {
      this.parametros = this.parametros.concat('&tipoRes=' + this.cadenaFiltro[8]);
    }
    this.ngOnInit();
  }

  limpiarFiltro(): void {
    for (let i of this.cadenaFiltro) {
      i = '';
    }
    this.ngOnInit();
  }

  cargarDocumento(row: Resoluciones): void {
    this.popUp.loading();
    if (row.Estado !== 'Expedida') {
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_resoluciones/generar_resolucion/${row.Id}`
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            this.popUp.close();
            this.dialogConfig.data = response.Data as string;
            this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
          }
        }, error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resoluci??n.');
        }
      });
    } else {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion/${row.Id}`
      ).subscribe({
        next: (response2: Respuesta) => {
          if (response2.Success) {
            const resolucion = response2.Data as Resolucion;
            this.request.get(
              environment.GESTOR_DOCUMENTAL_SERVICE,
              `document/${resolucion.NuxeoUid}`
            ).subscribe({
              next: response => {
                this.popUp.close();
                this.dialogConfig.data = response.file as string;
                this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
              }, error: () => {
                this.popUp.close();
                this.popUp.error('No se ha podido generar la resoluci??n.');
              }
            });
          }
        }, error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resoluci??n.');
        }
      });
    }
  }

  editarResoluci??n(id: number): void {
    this.router.navigate(['../detalle_resolucion', { Id: id }], { relativeTo: this.route });
  }

  anularResoluci??n(id: number): void {
    this.popUp.confirm(
      'Anular Resoluci??n',
      '??Est?? seguro que desea anular la resoluci??n?',
      'delete'
    ).then(result => {
      if (result.isConfirmed) {
        this.request.delete(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones`,
          id
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.popUp.success('La resoluci??n ha sido anulada con ??xito').then(() => {
                this.ngOnInit();
              });
            }
          }, error: () => {
            this.popUp.error('No se ha podido anular la resoluci??n.');
          }
        });
      }
    });
  }

  consultarVinculacionesResoluci??n(id: number): void {
    this.router.navigate(['../listar_vinculaciones', { Id: id, tipo: 'vista' }], { relativeTo: this.route });
  }

  vincularDocentesResoluci??n(id: number): void {
    this.router.navigate(['../vincular_docentes', { Id: id }], { relativeTo: this.route });
  }

  cancelarDocentesResoluci??n(id: number): void {
    this.router.navigate(['../cancelar_vinculaciones', { Id: id }], { relativeTo: this.route });
  }

  adicionarHorasDocentesResoluci??n(id: number): void {
    this.router.navigate(['../listar_vinculaciones', { Id: id, tipo: 'adicion' }], { relativeTo: this.route });
  }

  reducirHorasDocentesResoluci??n(id: number): void {
    this.router.navigate(['../listar_vinculaciones', { Id: id, tipo: 'reduccion' }], { relativeTo: this.route });
  }

  enviarRevision(Id: number): void {
    this.popUp.confirm(
      'Enviar a revisi??n',
      '??Est?? seguro de enviar esta resoluci??n a revisi??n?',
      'update'
    ).then(result => {
      if (result.isConfirmed) {
        const estado = {
          ResolucionId: Id,
          Estado: 'RREV',
          Usuario: localStorage.getItem('user'),
        };
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones/actualizar_estado`,
          estado
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.popUp.success('La resoluci??n ha sido enviada a revisi??n con ??xito').then(() => {
                this.ngOnInit();
              });
            }
          }, error: () => {
            this.popUp.error('No se ha podido enviar la resoluci??n a revisi??n.');
          }
        });
      }
    });
  }

  crearResolucion(): void {
    this.router.navigate(['../generacion_resolucion'], { relativeTo: this.route });
  }

  consultarDocente(): void {
    this.router.navigate(['../consulta_docente'], { relativeTo: this.route });
  }

}

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
import { UserService } from '../services/userService';
import { VinculacionTercero } from 'src/app/@core/models/vinculacion_tercero';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';

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
  dependenciaUsuario = 0;
  filtrarFacultad: boolean;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private userService: UserService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.resolucionesData = new ResolucionesDataSourceComponent(this.http, this.popUp, this.request, this.filtrarFacultad?`Facultad=${this.dependenciaUsuario}`:'', {
      endPoint: `${environment.RESOLUCIONES_MID_V2_SERVICE}gestion_resoluciones`,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      filterFieldKey: '#field#',
      totalKey: 'Total',
    });
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = '';
    this.userService.dependenciaUser$.subscribe((data: VinculacionTercero) => {
      this.dependenciaUsuario = data.DependenciaId?data.DependenciaId:0;
    });
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
    TablaResoluciones.Estado.filter = true;
    TablaResoluciones.TipoResolucion.filter = true;
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
      case 'rp':
        this.asignarRp(rowData.Id);
        break;
      case 'editar':
        this.editarResolución(rowData.Id);
        break;
      case 'anular':
        this.anularResolución(rowData.Id);
        break;
      case 'consultar':
        this.consultarVinculacionesResolución(rowData.Id);
        break;
      case 'vincular':
        this.vincularDocentesResolución(rowData.Id);
        break;
      case 'cancelar':
        this.cancelarDocentesResolución(rowData.Id);
        break;
      case 'enviar':
        this.enviarRevision(rowData.Id);
        break;
      case 'adicionar':
        this.adicionarHorasDocentesResolución(rowData.Id);
        break;
      case 'reducir':
        this.reducirHorasDocentesResolución(rowData.Id);
        break;
    }
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
          this.popUp.error('No se ha podido generar la resolución.');
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
                this.popUp.error('No se ha podido generar la resolución.');
              }
            });
          }
        }, error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resolución.');
        }
      });
    }
  }

  asignarRp(id: number): void {
    this.router.navigate(['rp_vinculacion', { Id: id }], { relativeTo: this.route });
  }

  editarResolución(id: number): void {
    this.router.navigate(['detalle_resolucion', { Id: id }], { relativeTo: this.route });
  }

  anularResolución(id: number): void {
    this.popUp.confirm(
      'Anular Resolución',
      '¿Está seguro que desea anular la resolución?',
      'delete'
    ).then(result => {
      if (result.isConfirmed) {
        this.popUp.loading();
        this.request.delete(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones`,
          id
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.popUp.close();
              this.popUp.success('La resolución ha sido anulada con éxito').then(() => {
                this.ngOnInit();
              });
            }
          }, error: () => {
            this.popUp.close();
            this.popUp.error('No se ha podido anular la resolución.');
          }
        });
      }
    });
  }

  consultarVinculacionesResolución(id: number): void {
    this.router.navigate(['listar_vinculaciones', { Id: id, tipo: 'vista' }], { relativeTo: this.route });
  }

  vincularDocentesResolución(id: number): void {
    this.router.navigate(['vincular_docentes', { Id: id }], { relativeTo: this.route });
  }

  cancelarDocentesResolución(id: number): void {
    this.router.navigate(['cancelar_vinculaciones', { Id: id }], { relativeTo: this.route });
  }

  adicionarHorasDocentesResolución(id: number): void {
    this.router.navigate(['listar_vinculaciones', { Id: id, tipo: 'adicion' }], { relativeTo: this.route });
  }

  reducirHorasDocentesResolución(id: number): void {
    this.router.navigate(['listar_vinculaciones', { Id: id, tipo: 'reduccion' }], { relativeTo: this.route });
  }

  enviarRevision(Id: number): void {
    this.popUp.confirm(
      'Enviar a revisión',
      '¿Está seguro de enviar esta resolución a revisión?',
      'update'
    ).then(result => {
      if (result.isConfirmed) {
        this.popUp.loading();
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_vinculaciones/${Id}`
        ).subscribe({
          next: (response: Respuesta) => {
            if ((response.Data as Vinculaciones[]).length > 0) {
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
                    this.popUp.close();
                    this.popUp.success('La resolución ha sido enviada a revisión con éxito').then(() => {
                      this.ngOnInit();
                    });
                  }
                }, error: () => {
                  this.popUp.close();
                  this.popUp.error('No se ha podido enviar la resolución a revisión.');
                }
              });
            } else {
              this.popUp.close();
              this.popUp.warning('La resolución no contiene vinculaciones, realice vinculaciones para poder enviar la resolución.')
            }
          }, error: () =>{
            this.popUp.close();
            this.popUp.error('No se ha podido enviar la resolución a revisión.');
          }
        });
      }
    });
  }

  crearResolucion(): void {
    this.router.navigate(['generacion_resolucion'], { relativeTo: this.route });
  }

  consultarDocente(): void {
    this.router.navigate(['consulta_docente'], { relativeTo: this.route });
  }

}

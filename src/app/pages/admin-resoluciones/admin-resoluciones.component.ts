import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { ActionsAssistanceComponent } from 'src/app/@core/components/actions-assistance/actions-assistance.component';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ExpedirVinculacionComponent } from './expedir-vinculacion/expedir-vinculacion.component';
import { ExpedirModificacionComponent } from './expedir-modificacion/expedir-modificacion.component';
import { ExpedirCancelacionComponent } from './expedir-cancelacion/expedir-cancelacion.component';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ModalDocumentoViewerComponent } from '../modal-documento-viewer/modal-documento-viewer.component';
import { UtilService } from '../services/utilService';
import { UserService } from '../services/userService';
import { SmartTableCommitFilterComponent } from 'src/app/@core/components/smart-table-commit-filter/smart-table-commit-filter.component';
import { cloneTableDefinition } from 'src/app/@core/models/smart-table.util';
import {
  AlcanceUsuario,
  DependenciaUsuario,
  ResolucionesScopeService,
} from '../services/resoluciones-scope.service';

@Component({
  selector: 'app-admin-resoluciones',
  templateUrl: './admin-resoluciones.component.html',
  styleUrls: ['./admin-resoluciones.component.scss']
})
export class AdminResolucionesComponent implements OnInit {

  dialogConfig: MatDialogConfig;
  icono: string;

  adminResolucionesSettings: any;
  adminResolucionesData: ResolucionesDataSourceComponent;

  numeroDocumento = '';
  rolesUsuario: string[] = [];
  rolesParam = '';

  rolPrincipal = '';
  esGlobal = false;

  dependencias: DependenciaUsuario[] = [];
  dependenciaSeleccionada: number | null = null;

  mostrarTabla = false;

  constructor(
    private request: RequestManager,
    private dialog: MatDialog,
    private http: HttpClient,
    private popUp: UtilService,
    private userService: UserService,
    private resolucionesScopeService: ResolucionesScopeService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = {};

    this.cargarDatosUsuario();
    this.cargarAlcanceUsuario();
  }

  get mostrarFiltroDependencia(): boolean {
    return !this.esGlobal && this.dependencias.length > 0;
  }

  cargarDatosUsuario(): void {
    const context = this.resolucionesScopeService.getUsuarioContext();

    if (!context) {
      this.popUp.warning('No se encontró la información del usuario autenticado.');
      return;
    }

    this.numeroDocumento = context.numeroDocumento;
    this.rolesUsuario = context.rolesUsuario;
    this.rolesParam = context.rolesParam;
  }

  cargarAlcanceUsuario(): void {
    if (!this.numeroDocumento || !this.rolesParam) {
      this.popUp.warning('No se encontró la información del usuario autenticado.');
      return;
    }

    this.popUp.loading();

    this.resolucionesScopeService.getAlcanceUsuario(
      this.numeroDocumento,
      this.rolesParam,
    ).subscribe({
      next: (alcance: AlcanceUsuario) => {
        this.popUp.close();

        this.rolPrincipal = alcance?.rol_principal || '';
        this.esGlobal = !!alcance?.es_global;
        this.dependencias = alcance?.dependencias || [];
        this.dependenciaSeleccionada = this.resolucionesScopeService.getDependenciaInicial(
          this.esGlobal,
          this.dependencias,
        );

        this.mostrarTabla = false;
        this.adminResolucionesData = undefined;
      },
      error: (error) => {
        this.popUp.close();
        this.mostrarTabla = false;
        this.adminResolucionesData = undefined;
        const mensaje = error?.error?.Message || 'No se pudo determinar el alcance del usuario.';
        this.popUp.error(mensaje);
      }
    });
  }

  consultarResoluciones(): void {
    if (!this.esGlobal && !this.dependenciaSeleccionada) {
      this.popUp.warning('Debe seleccionar una dependencia para realizar la consulta.');
      return;
    }

    this.cargarTabla();
  }

  limpiarConsulta(): void {
    this.dependenciaSeleccionada = (!this.esGlobal && this.dependencias.length === 1)
      ? Number(this.dependencias[0].id_oikos)
      : null;

    this.mostrarTabla = false;
    this.adminResolucionesData = undefined;
  }

  limpiarFiltrosTabla(): void {
    if (!this.adminResolucionesData) {
      return;
    }

    this.adminResolucionesData.setFilter([]);
  }

  cargarTabla(): void {
    let query = 'Estado=Expedida|Aprobada';

    if (!this.esGlobal && this.dependenciaSeleccionada) {
      query = `Facultad=${this.dependenciaSeleccionada}&${query}`;
    }

    this.adminResolucionesData = new ResolucionesDataSourceComponent(
      this.http,
      this.popUp,
      this.request,
      query,
      {
        endPoint: `${environment.RESOLUCIONES_MID_V2_SERVICE}gestion_resoluciones`,
        dataKey: 'Data',
        pagerPageKey: 'offset',
        pagerLimitKey: 'limit',
        filterFieldKey: '#field#',
        totalKey: 'Total',
      }
    );

    this.mostrarTabla = true;
  }

  initTable(): void {
    const columns = cloneTableDefinition(TablaResolucion);

    columns['Acciones'] = {
      title: 'Acciones',
      editable: true,
      filter: false,
      width: '4%',
      type: 'custom',
      renderComponent: ActionsAssistanceComponent,
      onComponentInitFunction: (instance: ActionsAssistanceComponent) => {
        instance.modulo = 'admin';
        instance.icon.subscribe((res: string) => {
          this.icono = res;
        });
        instance.data.subscribe((data: Resoluciones) => {
          this.eventHandler(this.icono, data);
        });
      },
    };

    const filtroTabla = {
      type: 'custom',
      component: SmartTableCommitFilterComponent,
    };

    columns.NumeroResolucion.filter = filtroTabla;
    columns.Vigencia.filter = filtroTabla;
    columns.Facultad.filter = filtroTabla;
    columns.TipoResolucion.filter = filtroTabla;
    columns.NivelAcademico.filter = filtroTabla;
    columns.Dedicacion.filter = filtroTabla;
    columns.Estado.filter = filtroTabla;

    this.adminResolucionesSettings = {
      columns,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
      noDataMessage: 'No hay resoluciones aprobadas en el sistema',
    };
  }

  eventHandler(event: string, rowData: Resoluciones): void {
    switch (event) {
      case 'documento':
        this.cargarDocumento(rowData);
        break;
      case 'expedicion':
        this.expedirVista(rowData);
        break;
    }
  }

  cargarDocumento(rowData: Resoluciones): void {
    this.popUp.loading();

    if (rowData.Estado === 'Expedida') {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion/${rowData.Id}`
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            const resolucion = response.Data as Resolucion;

            this.request.get(
              environment.GESTOR_DOCUMENTAL_SERVICE,
              `document/${resolucion.NuxeoUid}`
            ).subscribe({
              next: response2 => {
                this.popUp.close();
                this.dialogConfig.data = response2.file as string;
                this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
              },
              error: () => {
                this.popUp.close();
                this.popUp.error('No se ha podido generar la resolución.');
              }
            });
          }
        },
        error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resolución.');
        }
      });
    } else {
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_resoluciones/generar_resolucion/${rowData.Id}`
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            this.popUp.close();
            this.dialogConfig.data = response.Data as string;
            this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
          }
        },
        error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resolución.');
        }
      });
    }
  }

  expedirVista(rowData: Resoluciones): void {
    const cadena = rowData.TipoResolucion.replace('Resolución de ', '');
    let dialogo: MatDialogRef<any>;
    this.dialogConfig.data = rowData;

    switch (cadena) {
      case 'Vinculación':
        dialogo = this.dialog.open(ExpedirVinculacionComponent, this.dialogConfig);
        break;
      case 'Adición':
      case 'Reducción':
        dialogo = this.dialog.open(ExpedirModificacionComponent, this.dialogConfig);
        break;
      case 'Cancelación':
        dialogo = this.dialog.open(ExpedirCancelacionComponent, this.dialogConfig);
        break;
    }

    dialogo.afterClosed().subscribe((resp: boolean) => {
      if (resp) {
        this.consultarResoluciones();
      }
    });
  }
}

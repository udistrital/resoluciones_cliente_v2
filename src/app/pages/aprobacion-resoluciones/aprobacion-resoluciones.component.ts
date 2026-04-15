import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActionsAssistanceComponent } from 'src/app/@core/components/actions-assistance/actions-assistance.component';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { environment } from 'src/environments/environment';
import { ModalDocumentoViewerComponent } from '../modal-documento-viewer/modal-documento-viewer.component';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { UtilService } from '../services/utilService';
import { SmartTableCommitFilterComponent } from 'src/app/@core/components/smart-table-commit-filter/smart-table-commit-filter.component';
import { cloneTableDefinition } from 'src/app/@core/models/smart-table.util';
import {
  AlcanceUsuario,
  DependenciaUsuario,
  ResolucionesScopeService,
} from '../services/resoluciones-scope.service';

@Component({
  selector: 'app-aprobacion-resoluciones',
  templateUrl: './aprobacion-resoluciones.component.html',
  styleUrls: ['./aprobacion-resoluciones.component.scss']
})
export class AprobacionResolucionesComponent implements OnInit {

  aprobResolucionesSettings: any;
  aprobResolucionesData: ResolucionesDataSourceComponent;

  dialogConfig: MatDialogConfig;
  icono: string;

  numeroDocumento = '';
  rolesUsuario: string[] = [];
  rolesParam = '';

  rolPrincipal = '';
  esGlobal = false;

  dependencias: DependenciaUsuario[] = [];
  dependenciaSeleccionada: number | null = null;

  mostrarTabla = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private request: RequestManager,
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
        this.aprobResolucionesData = undefined;
      },
      error: (error) => {
        this.popUp.close();
        this.mostrarTabla = false;
        this.aprobResolucionesData = undefined;
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
    this.aprobResolucionesData = undefined;
  }

  limpiarFiltrosTabla(): void {
    if (!this.aprobResolucionesData) {
      return;
    }

    this.aprobResolucionesData.setFilter([]);
  }

  cargarTabla(): void {
    let query = 'Estado=Aprobada|Por revisar';

    if (!this.esGlobal && this.dependenciaSeleccionada) {
      query = `Facultad=${this.dependenciaSeleccionada}&${query}`;
    }

    this.aprobResolucionesData = new ResolucionesDataSourceComponent(
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
        instance.modulo = 'aprob';
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

    this.aprobResolucionesSettings = {
      columns,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
      noDataMessage: 'No hay resoluciones inscritas en el sistema',
    };
  }

  eventHandler(event: string, rowData: Resoluciones): void {
    switch (event) {
      case 'documento':
        this.cargarDocumento(rowData);
        break;
      case 'aprobar':
        this.modificarEstado(rowData, 'RAPR', 'Aprobar');
        break;
      case 'rechazar':
        this.modificarEstado(rowData, 'RECH', 'Rechazar');
        break;
    }
  }

  modificarEstado(res: Resoluciones, CodigoEstado: string, nombreEstado: string): void {
    this.popUp.confirm(
      `${nombreEstado} resolucion`,
      `¿Está seguro que desea ${nombreEstado} esta resolución?`,
      'update'
    ).then(result => {
      if (result.isConfirmed) {
        const estado = {
          ResolucionId: res.Id,
          Estado: CodigoEstado,
          Usuario: localStorage.getItem('user'),
        };

        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones/actualizar_estado`,
          estado
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.popUp.success('El estado de la resolución ha sido modificado con éxito.').then(() => {
                this.consultarResoluciones();
              });
            }
          },
          error: () => {
            this.popUp.error('No se ha podido actualizar el estado de la resolución.');
          }
        });
      }
    });
  }

  cargarDocumento(rowData: Resoluciones): void {
    this.popUp.loading();

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

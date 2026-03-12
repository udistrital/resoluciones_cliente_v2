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

interface DependenciaUsuario {
  codigo_dependencia: number;
  id_oikos: number;
  nombre?: string;
  rol?: string;
}

interface AlcanceUsuario {
  rol_principal: string;
  es_global: boolean;
  dependencias: DependenciaUsuario[];
}

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
    const user = this.userService.getCurrentUser();

    if (!user) {
      this.popUp.warning('No se encontró la información del usuario autenticado.');
      return;
    }

    this.numeroDocumento = this.userService.getUserDocument() || '';

    const roles = user?.userService?.role || user?.role || [];

    if (Array.isArray(roles)) {
      this.rolesUsuario = roles
        .map((rol: string) => String(rol).trim().toUpperCase())
        .filter((rol: string) => !!rol);
    } else if (typeof roles === 'string' && roles.trim()) {
      this.rolesUsuario = [roles.trim().toUpperCase()];
    } else {
      this.rolesUsuario = [];
    }

    const rolesPermitidos = [
      'ADMINISTRADOR_RESOLUCIONES',
      'ASIS_FINANCIERA',
      'DECANO',
      'ASISTENTE_DECANATURA'
    ];

    this.rolesUsuario = this.rolesUsuario.filter(r => rolesPermitidos.includes(r));
    this.rolesParam = this.rolesUsuario.join(',');
  }

  cargarAlcanceUsuario(): void {
    if (!this.numeroDocumento || !this.rolesParam) {
      this.popUp.warning('No se encontró la información del usuario autenticado.');
      return;
    }

    this.popUp.loading();

    const query =
      `?roles=${encodeURIComponent(this.rolesParam)}` +
      `&numero_documento=${encodeURIComponent(this.numeroDocumento)}`;

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `resoluciones_por_rol/dependencias${query}`
    ).subscribe({
      next: (response: Respuesta) => {
        this.popUp.close();

        if (response.Success) {
          const alcance = response.Data as AlcanceUsuario;

          this.rolPrincipal = alcance?.rol_principal || '';
          this.esGlobal = !!alcance?.es_global;
          this.dependencias = alcance?.dependencias || [];

          if (!this.esGlobal && this.dependencias.length === 1) {
            this.dependenciaSeleccionada = Number(this.dependencias[0].id_oikos);
          } else {
            this.dependenciaSeleccionada = null;
          }

          this.mostrarTabla = false;
          this.aprobResolucionesData = undefined;
        } else {
          this.mostrarTabla = false;
          this.aprobResolucionesData = undefined;
          this.popUp.error('No se pudo determinar el alcance del usuario.');
        }
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
    TablaResolucion['Acciones'] = {
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

    this.aprobResolucionesSettings = {
      columns: TablaResolucion,
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

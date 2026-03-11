import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';
import { UserService } from '../services/userService';

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
  selector: 'app-plantillas',
  templateUrl: './plantillas.component.html',
  styleUrls: ['./plantillas.component.scss'],
})
export class PlantillasComponent implements OnInit {

  plantillasSettings: any;
  plantillasData: LocalDataSource = new LocalDataSource([]);
  selectedTab = 0;
  resolucionId = 0;
  copia = false;

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
    private popUp: UtilService,
    private userService: UserService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
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
          this.plantillasData = new LocalDataSource([]);
        } else {
          this.mostrarTabla = false;
          this.plantillasData = new LocalDataSource([]);
          this.popUp.error('No se pudo determinar el alcance del usuario.');
        }
      },
      error: (error) => {
        this.popUp.close();
        this.mostrarTabla = false;
        this.plantillasData = new LocalDataSource([]);
        const mensaje = error?.error?.Message || 'No se pudo determinar el alcance del usuario.';
        this.popUp.error(mensaje);
      }
    });
  }

  cargarPlantillas(): void {
    if (!this.numeroDocumento || !this.rolesParam) {
      this.popUp.warning('No se encontró la información del usuario autenticado.');
      return;
    }

    if (!this.esGlobal && !this.dependenciaSeleccionada) {
      this.popUp.warning('Debe seleccionar una dependencia para realizar la consulta.');
      return;
    }

    this.popUp.loading();

    let query =
      `?numero_documento=${encodeURIComponent(this.numeroDocumento)}` +
      `&roles=${encodeURIComponent(this.rolesParam)}`;

    if (this.dependenciaSeleccionada) {
      query += `&Facultad=${encodeURIComponent(String(this.dependenciaSeleccionada))}`;
    }

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_plantillas${query}`
    ).subscribe({
      next: (response: Respuesta) => {
        this.popUp.close();

        if (response.Success) {
          this.plantillasData = new LocalDataSource(response.Data || []);
          this.mostrarTabla = true;
        } else {
          this.plantillasData = new LocalDataSource([]);
          this.mostrarTabla = false;
          this.popUp.error('No se han podido cargar las plantillas');
        }
      },
      error: (error) => {
        this.popUp.close();
        this.plantillasData = new LocalDataSource([]);
        this.mostrarTabla = false;
        const mensaje = error?.error?.Message || 'No se han podido cargar las plantillas';
        this.popUp.error(mensaje);
      }
    });
  }

  limpiarConsulta(): void {
    this.dependenciaSeleccionada = (!this.esGlobal && this.dependencias.length === 1)
      ? Number(this.dependencias[0].id_oikos)
      : null;

    this.plantillasData = new LocalDataSource([]);
    this.selectedTab = 0;
    this.resolucionId = 0;
    this.copia = false;
    this.mostrarTabla = false;
  }

  initTable(): void {
    this.plantillasSettings = {
      columns: {
        Id: {
          hide: true,
        },
        Dedicacion: {
          title: 'Dedicacion',
          width: '15%',
          editable: false,
        },
        NivelAcademico: {
          title: 'Nivel Academico',
          width: '25%',
          editable: false,
        },
        Facultad: {
          title: 'Facultad',
          width: '30%',
          editable: false,
        },
        TipoResolucion: {
          title: 'Tipo de Resolucion',
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'editar',
            title: '<em class="material-icons" title="Editar plantilla">edit</em>',
          },
          {
            name: 'borrar',
            title: '<em class="material-icons" title="Eliminar plantilla">delete</em>',
          },
        ]
      },
      add: {
        addButtonContent: '<i class="material-icons title="Agregar plantilla">add_circle_outline</i>',
      },
      noDataMessage: 'No hay plantillas de resoluciones registradas en el sistema',
    };
  }

  eventHandler(event: any): void {
    switch (event.action) {
      case 'editar':
        this.editPlantilla(event);
        break;
      case 'copiar':
        this.copyPlantilla(event);
        break;
      case 'borrar':
        this.deletePlantilla(event);
        break;
    }
  }

  copyPlantilla(event: any): void {
    this.setSelectedTab(1, false);
    this.copia = true;
    this.resolucionId = event.data.Id;
  }

  createPlantilla(): void {
    this.setSelectedTab(1, false);
    this.resolucionId = this.resolucionId === 0 ? undefined : 0;
  }

  editPlantilla(event: any): void {
    this.setSelectedTab(1, false);
    this.copia = false;
    this.resolucionId = event.data.Id;
  }

  deletePlantilla(event: any): void {
    this.popUp.confirm(
      'Eliminar plantilla',
      '¿Esta seguro que desea eliminar esta plantilla?',
      'delete'
    ).then(result => {
      if (result.isConfirmed) {
        this.request.delete(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_plantillas`,
          event.data.Id
        ).subscribe((response: Respuesta) => {
          if (response.Success) {
            this.popUp.success('La plantilla se ha eliminado con éxito.').then(() => {
              this.cargarPlantillas();
            });
          } else {
            this.popUp.error('No se ha podido eliminar la plantilla.');
          }
        });
      }
    });
  }

  setSelectedTab(tab: number, update: boolean): void {
    this.selectedTab = tab;
    this.resolucionId = 0;
    if (update) {
      this.cargarPlantillas();
    }
  }
}

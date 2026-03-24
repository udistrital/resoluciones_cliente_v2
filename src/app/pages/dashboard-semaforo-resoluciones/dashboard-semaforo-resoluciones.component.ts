import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';
import { UserService } from '../services/userService';
import { environment } from 'src/environments/environment';
import { Respuesta } from 'src/app/@core/models/respuesta';
import {
  DashboardSemaforoResolucionesData,
  RespuestaDashboardSemaforoResoluciones,
  ResumenDashboardResolucion,
} from 'src/app/@core/models/dashboard-semaforo-resoluciones';
import { VinculacionTercero } from 'src/app/@core/models/vinculacion_tercero';

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
  selector: 'app-dashboard-semaforo-resoluciones',
  templateUrl: './dashboard-semaforo-resoluciones.component.html',
  styleUrls: ['./dashboard-semaforo-resoluciones.component.scss'],
})
export class DashboardSemaforoResolucionesComponent implements OnInit {
  cargando = false;
  cargandoDependencias = false;
  error: string | null = null;

  numeroDocumento = '';
  rolesUsuario: string[] = [];
  rolesParam = '';

  rolPrincipal = '';
  esGlobal = false;
  dependenciaUsuario = 0;

  dependencias: DependenciaUsuario[] = [];
  dependenciaSeleccionada: number | null = null;

  vigenciaSeleccionada: number = new Date().getFullYear();
  vigencias: number[] = [];

  dashboardData: DashboardSemaforoResolucionesData | null = null;
  resoluciones: ResumenDashboardResolucion[] = [];

  pageSize = 10;
  offset = 0;
  total = 0;

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private router: Router,
    private userService: UserService,
  ) {
    this.initVigencias();
  }

  ngOnInit(): void {
    this.userService.dependenciaUser$.subscribe((data: VinculacionTercero) => {
      this.dependenciaUsuario = data?.DependenciaId ? data.DependenciaId : 0;
    });

    this.cargarDatosUsuario();

    if (this.numeroDocumento && this.rolesParam) {
      this.cargarAlcanceUsuario();
    }
  }

  initVigencias(): void {
    const actual = new Date().getFullYear();
    this.vigencias = [actual, actual - 1, actual - 2, actual - 3, actual - 4];
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
      'ASISTENTE_DECANATURA',
    ];

    this.rolesUsuario = this.rolesUsuario.filter(r => rolesPermitidos.includes(r));
    this.rolesParam = this.rolesUsuario.join(',');
  }

    obtenerNombreDependenciaSeleccionada(): string {
    if (!this.dependenciaSeleccionada) {
      return 'Todas';
    }

    const encontrada = this.dependencias.find(
      dep => Number(dep.id_oikos) === Number(this.dependenciaSeleccionada),
    );

    return encontrada?.nombre || String(this.dependenciaSeleccionada);
  }

  cargarAlcanceUsuario(): void {
    if (!this.numeroDocumento || !this.rolesParam) {
      return;
    }

    this.cargandoDependencias = true;

    const query =
      `?roles=${encodeURIComponent(this.rolesParam)}` +
      `&numero_documento=${encodeURIComponent(this.numeroDocumento)}`;

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `resoluciones_por_rol/dependencias${query}`,
    ).subscribe({
      next: (response: Respuesta) => {
        this.cargandoDependencias = false;

        if (response.Success) {
          const alcance = response.Data as AlcanceUsuario;
          this.rolPrincipal = alcance?.rol_principal || '';
          this.esGlobal = !!alcance?.es_global;
          this.dependencias = alcance?.dependencias || [];

          if (!this.esGlobal && this.dependencias.length === 1) {
            this.dependenciaSeleccionada = Number(this.dependencias[0].id_oikos);
          }
          ;
        } else {
          this.esGlobal = false;
          this.rolPrincipal = '';
          this.dependencias = [];
        }
      },
      error: () => {
        this.cargandoDependencias = false;
        this.esGlobal = false;
        this.rolPrincipal = '';
        this.dependencias = [];
        this.error = 'No fue posible cargar el alcance del usuario.';
      },
    });
  }

  get mostrarFiltroDependencia(): boolean {
    return this.esGlobal || this.dependencias.length > 1;
  }

  consultarDashboard(resetOffset: boolean = true): void {
    if (!this.numeroDocumento || !this.rolesParam) {
      this.error = 'No se pudo obtener la información del usuario.';
      return;
    }

    if (!this.vigenciaSeleccionada) {
      this.popUp.warning('Seleccione una vigencia.');
      return;
    }

    if (!this.esGlobal && this.dependencias.length > 1 && !this.dependenciaSeleccionada) {
      this.popUp.warning('Seleccione una dependencia.');
      return;
    }

    if (!this.esGlobal && this.dependencias.length === 1 && !this.dependenciaSeleccionada) {
      this.dependenciaSeleccionada = Number(this.dependencias[0].id_oikos);
    }

    if (resetOffset) {
      this.offset = 0;
    }

    this.cargando = true;
    this.error = null;

    let endpoint =
      `gestion_vinculaciones/dashboard_resoluciones` +
      `?numero_documento=${encodeURIComponent(this.numeroDocumento)}` +
      `&roles=${encodeURIComponent(this.rolesParam)}` +
      `&vigencia=${encodeURIComponent(String(this.vigenciaSeleccionada))}` +
      `&limit=${encodeURIComponent(String(this.pageSize))}` +
      `&offset=${encodeURIComponent(String(this.offset))}`;

    if (this.dependenciaSeleccionada) {
      endpoint += `&id_oikos=${encodeURIComponent(String(this.dependenciaSeleccionada))}`;
    }

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      endpoint,
    ).subscribe({
      next: (response: RespuestaDashboardSemaforoResoluciones) => {
        this.cargando = false;

        if (response?.Success && response.Data) {
          this.dashboardData = response.Data;
          this.resoluciones = response.Data.resoluciones || [];
          this.total = response.Data.total || 0;
        } else {
          this.dashboardData = null;
          this.resoluciones = [];
          this.total = 0;
          this.error = 'No se recibió información del dashboard.';
        }
      },
      error: (err) => {
        this.cargando = false;
        this.dashboardData = null;
        this.resoluciones = [];
        this.total = 0;
        this.error = err?.error?.Message || 'Error consultando dashboard.';
      },
    });
  }

  cambiarPagina(direccion: 'anterior' | 'siguiente'): void {
    if (direccion === 'anterior') {
      if (this.offset === 0) {
        return;
      }
      this.offset = Math.max(0, this.offset - this.pageSize);
    } else {
      if (this.offset + this.pageSize >= this.total) {
        return;
      }
      this.offset += this.pageSize;
    }

    this.consultarDashboard(false);
  }

  limpiarFiltros(): void {
    this.vigenciaSeleccionada = new Date().getFullYear();
    this.dependenciaSeleccionada = (!this.esGlobal && this.dependencias.length === 1)
      ? Number(this.dependencias[0].id_oikos)
      : null;

    this.offset = 0;
    this.dashboardData = null;
    this.resoluciones = [];
    this.total = 0;

    this.consultarDashboard();
  }

  verDetalle(resolucionId: number): void {
    this.router.navigate(['/pages/dashboard_semaforo_resoluciones/detalle', resolucionId]);
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'CON_SIN_RP':
        return 'estado-sin-rp';
      case 'CON_PENDIENTES_TITAN':
        return 'estado-pendiente';
      case 'COMPLETA':
        return 'estado-completa';
      default:
        return 'estado-default';
    }
  }

  get paginaActual(): number {
    return Math.floor(this.offset / this.pageSize) + 1;
  }

  get totalPaginas(): number {
    if (!this.total || !this.pageSize) {
      return 1;
    }
    return Math.ceil(this.total / this.pageSize);
  }

  get puedeIrAnterior(): boolean {
    return this.offset > 0;
  }

  get puedeIrSiguiente(): boolean {
    return this.offset + this.pageSize < this.total;
  }

  getPorcentaje(valor: number, total: number): number {
  if (!total || total <= 0) {
    return 0;
  }
  return (valor / total) * 100;
}

getSemaforoTexto(item: ResumenDashboardResolucion): string {
  if (item.estado_general_codigo === 'COMPLETA') {
    return 'Completa';
  }
  if (item.estado_general_codigo === 'CON_PENDIENTES_TITAN') {
    return 'Pendiente Titan';
  }
  if (item.estado_general_codigo === 'CON_SIN_RP') {
    return 'Sin RP';
  }
  return 'Sin estado';
}
}

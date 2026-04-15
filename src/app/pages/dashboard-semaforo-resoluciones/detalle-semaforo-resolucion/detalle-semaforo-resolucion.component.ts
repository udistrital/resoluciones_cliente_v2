import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { UserService } from '../../services/userService';
import { environment } from 'src/environments/environment';
import {
  EstadoSemaforoVinculacion,
  RespuestaSemaforoResolucion,
  SemaforoResolucionData,
} from 'src/app/@core/models/semaforo-resolucion';
import { ResolucionesScopeService } from '../../services/resoluciones-scope.service';

@Component({
  selector: 'app-detalle-semaforo-resolucion',
  templateUrl: './detalle-semaforo-resolucion.component.html',
  styleUrls: ['./detalle-semaforo-resolucion.component.scss']
})
export class DetalleSemaforoResolucionComponent implements OnInit {
  cargando = false;
  error: string | null = null;

  resolucionId!: number;
  numeroDocumento = '';
  rolesUsuario: string[] = [];
  rolesParam = '';

  dashboardData: SemaforoResolucionData | null = null;
  detalleOriginal: EstadoSemaforoVinculacion[] = [];
  detalleFiltrado: EstadoSemaforoVinculacion[] = [];

  filtroDocumento = '';
  filtroEstado = '';

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private userService: UserService,
    private router: Router,
    private resolucionesScopeService: ResolucionesScopeService,
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();

    this.route.paramMap.subscribe(params => {
      const id = params.get('Id');
      if (id) {
        this.resolucionId = Number(id);
        this.consultarDashboard();
      }
    });
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

  consultarDashboard(numeroDocumentoFiltro?: string): void {
    if (!this.resolucionId) {
      this.error = 'No se recibió el id de la resolución.';
      return;
    }

    if (!this.numeroDocumento || !this.rolesParam) {
      this.error = 'No se pudo obtener la información del usuario autenticado.';
      return;
    }

    this.cargando = true;
    this.error = null;

    let endpoint =
      `gestion_vinculaciones/consultar_semaforo_resolucion/${this.resolucionId}` +
      `?usuario=${encodeURIComponent(this.numeroDocumento)}` +
      `&roles=${encodeURIComponent(this.rolesParam)}`;

    if (numeroDocumentoFiltro && numeroDocumentoFiltro.trim()) {
      endpoint += `&numero_documento=${encodeURIComponent(numeroDocumentoFiltro.trim())}`;
    }

    this.request
      .get(environment.RESOLUCIONES_MID_V2_SERVICE, endpoint)
      .pipe(finalize(() => {
        this.cargando = false;
      }))
      .subscribe({
        next: (response: any) => {
          if (response && response.Data) {
            this.dashboardData = response.Data;
            this.detalleOriginal = [...response.Data.detalle];
            this.detalleFiltrado = [...response.Data.detalle];
            this.aplicarFiltrosLocales();
          } else {
            this.error = 'El servicio no devolvió datos válidos';
          }

          this.cargando = false;
        },
        error: (err) => {
          this.error = err?.error?.Message || 'Error consultando dashboard';
          this.cargando = false;
          this.popUp.error(this.error);
        },
      });
  }

  buscarPorDocumento(): void {
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    this.detalleFiltrado = this.detalleOriginal.filter(item => {
      const cumpleDocumento =
        !this.filtroDocumento ||
        item.numero_documento.toString().includes(this.filtroDocumento.trim());

      const cumpleEstado =
        !this.filtroEstado || item.estado_codigo === this.filtroEstado;

      return cumpleDocumento && cumpleEstado;
    });
  }

  limpiarFiltros(): void {
    this.filtroDocumento = '';
    this.filtroEstado = '';
    this.aplicarFiltrosLocales();
  }

    volver(): void {
    this.router.navigate(['/pages/dashboard_semaforo_resoluciones']);
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'COMPLETO':
        return 'estado-completo';
      case 'PENDIENTE_TITAN':
        return 'estado-pendiente';
      case 'SIN_RP':
        return 'estado-sin-rp';
      default:
        return 'estado-default';
    }
  }

  obtenerClaseSegmento(estado: string): string {
    switch (estado) {
      case 'COMPLETO':
        return 'segmento-completa';
      case 'PENDIENTE_TITAN':
        return 'segmento-pendiente';
      case 'SIN_RP':
        return 'segmento-sin-rp';
      default:
        return 'segmento-default';
    }
  }

  obtenerSemaforoTexto(estado: string): string {
    switch (estado) {
      case 'COMPLETO':
        return 'Completo';
      case 'PENDIENTE_TITAN':
        return 'Pendiente Titan';
      case 'SIN_RP':
        return 'Sin RP';
      default:
        return 'Sin estado';
    }
  }
}

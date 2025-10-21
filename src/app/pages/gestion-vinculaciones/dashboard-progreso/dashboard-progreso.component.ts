import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard-progreso',
  templateUrl: './dashboard-progreso.component.html',
  styleUrls: ['./dashboard-progreso.component.scss']
})
export class DashboardProgresoComponent implements OnInit, OnDestroy {

  @Input() resolucionId: number | null = null;

  progreso: any = null;
  jobId: string | null = null;
  intervalSub: Subscription | null = null;
  estadoJob: 'activo' | 'finalizado' | 'inexistente' = 'inexistente';

  mostrarExitosos = false;
  mostrarOmitidos = false;
  mostrarErrores = false;
  mostrarPreliquidados = false;

  procesados: string[] = [];
  omitidos: string[] = [];
  errores: string[] = [];
  preliquidacion: string[] = [];

  constructor(private request: RequestManager) {}

  ngOnInit(): void {
    if (!this.resolucionId) return;

    const key = `jobId_${this.resolucionId}`;
    this.jobId = localStorage.getItem(key);

    if (this.jobId) this.validarJobExistente();

    window.addEventListener('job-iniciado', (event: any) => {
      if (event.detail?.resolucionId === this.resolucionId) {
        this.jobId = event.detail.jobId;
        localStorage.setItem(`jobId_${this.resolucionId}`, this.jobId);
        this.detenerSeguimiento();
        this.iniciarSeguimiento();
      }
    });
  }

  validarJobExistente(): void {
    if (!this.jobId) return;

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/progreso/${this.jobId}`
    ).subscribe({
      next: (response: any) => {
        if (response.Success) {
          this.progreso = response;
          this.estadoJob = response.Estado === 'Completado' ? 'finalizado' : 'activo';
          this.recalcularListas(response);
          if (this.estadoJob === 'activo') this.iniciarSeguimiento();
        } else {
          this.limpiarJob();
        }
      },
      error: (err) => {
        if (err.status === 404) this.limpiarJob();
      }
    });
  }

  iniciarSeguimiento(): void {
    if (!this.jobId) return;

    this.intervalSub = interval(1000).subscribe(() => {
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/progreso/${this.jobId}`
      ).subscribe({
        next: (response: any) => {
          if (response.Success) {
            this.progreso = response;
            this.recalcularListas(response);

            if (response.Estado === 'Completado') {
              this.estadoJob = 'finalizado';
              this.detenerSeguimiento();
            } else {
              this.estadoJob = 'activo';
            }
          } else {
            this.limpiarJob();
          }
        },
        error: (err) => {
          if (err.status === 404) this.limpiarJob();
        }
      });
    });
  }

  recalcularListas(response: any): void {
    const mensajes = response.Mensajes || [];

    this.procesados = [];
    this.omitidos = [];
    this.errores = [];
    this.preliquidacion = [];

    mensajes.forEach((msg: string) => {
      const texto = msg.toLowerCase();

      if (texto.includes('preliquid')) {
        this.preliquidacion.push(msg);
      } else if (texto.includes('omitido')) {
        this.omitidos.push(msg);
      } else if (texto.includes('error')) {
        this.errores.push(msg);
      } else if (
        (texto.includes('procesando') || texto.includes('finalizado')) &&
        !texto.includes('proceso finalizado correctamente')
      ) {
        this.procesados.push(msg);
      }
    });

    this.progreso.Procesados = this.procesados.length;
    this.progreso.Omitidos = this.omitidos.length;
    this.progreso.Errores = this.errores.length;
    this.progreso.Preliquidados = this.preliquidacion.length;
  }

  toggle(seccion: string): void {
    if (seccion === 'exitosos') this.mostrarExitosos = !this.mostrarExitosos;
    if (seccion === 'omitidos') this.mostrarOmitidos = !this.mostrarOmitidos;
    if (seccion === 'errores') this.mostrarErrores = !this.mostrarErrores;
    if (seccion === 'preliquidacion') this.mostrarPreliquidados = !this.mostrarPreliquidados;
  }

  detenerSeguimiento(): void {
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
      this.intervalSub = null;
    }
  }

  limpiarJob(): void {
    this.detenerSeguimiento();
    const key = `jobId_${this.resolucionId}`;
    localStorage.removeItem(key);
    this.jobId = null;
    this.estadoJob = 'inexistente';
    this.progreso = null;
  }

  ngOnDestroy(): void {
    this.detenerSeguimiento();
  }
}

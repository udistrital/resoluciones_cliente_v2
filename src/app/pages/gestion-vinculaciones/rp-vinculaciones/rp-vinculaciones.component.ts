import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { first, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Parametro } from 'src/app/@core/models/parametro';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { RpSeleccionado } from 'src/app/@core/models/rp_seleccionado';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-rp-vinculaciones',
  templateUrl: './rp-vinculaciones.component.html',
  styleUrls: ['./rp-vinculaciones.component.scss']
})
export class RpVinculacionesComponent implements OnInit {

  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  tipoResolucion: Parametro;
  rpsSeleccionados: RpSeleccionado[];
  vinc: any;
  guardarRp: boolean = false;

  isSubmitting: boolean = false;
  isFinalized: boolean = false;
  isJobActivo: boolean = false;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private router: Router,
    private popUp: UtilService,
  ) {
    this.vinculacionesData = new LocalDataSource();
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.tipoResolucion = new Parametro();
    this.rpsSeleccionados = [];
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        this.preloadData();
      }
      this.initTable();
    });
  }

  onEstadoJobChange(estado: 'activo' | 'finalizado' | 'inexistente'): void {
  this.isJobActivo = estado === 'activo';
}


  preloadData(): void {
    this.popUp.loading();
    forkJoin<[Respuesta, Respuesta]>([
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion/${this.resolucionId}`
      ).pipe(first()),
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion_vinculacion_docente/${this.resolucionId}`
      ).pipe(first()),
    ])
    .subscribe({
      next: ([resp1, resp2]: [Respuesta, Respuesta]) => {
        this.resolucion = resp1.Data as Resolucion;
        this.resolucionVinculacion = resp2.Data as ResolucionVinculacionDocente;

        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_vinculaciones/rp/${this.resolucionId}`
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.vinculacionesData.load(response.Data);
              this.vinc = response.Data;
              this.rps();
            }
            this.popUp.close();
          },
          error: () => {
            this.popUp.close();
            this.popUp.error('Ha ocurrido un error, comuníquese con el área de soporte.');
          }
        });

        this.request.get(
          environment.PARAMETROS_SERVICE,
          `parametro/${this.resolucion.TipoResolucionId}`
        ).subscribe({
          next: (response: Respuesta) => {
            this.tipoResolucion = response.Data as Parametro;
          },
          error: () => {
            this.popUp.error('Ha ocurrido un error, comuníquese con el área de soporte.');
          }
        });
      },
      error: () => {
        this.popUp.close();
        this.popUp.error('Ha ocurrido un error, comuníquese con el área de soporte.');
      }
    });
  }

  initTable(): void {
    const tabla = { ...TablaVinculaciones };

    this.vinculacionesSettings = {
      mode: 'external',
      columns: tabla,
      actions: false,
      selectedRowIndex: -1,
      hideSubHeader: true,
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
  }

  rps(): void {
    (this.vinc || []).forEach((element: any) => {
      if (element.RegistroPresupuestal !== 0) {
        const rp: RpSeleccionado = {
          Consecutivo: element.RegistroPresupuestal,
          Vigencia: element.Vigencia,
          VinculacionId: element.Id
        };
        this.rpsSeleccionados.push(rp);

        const user = JSON.parse(atob(localStorage.getItem('user') || '')) || null;
        this.guardarRp = !!user?.user?.role?.includes('ADMINISTRADOR_RESOLUCIONES');
      } else {
        this.guardarRp = false;
      }
    });
  }

  guardar(): void {
    if (this.isSubmitting || this.isFinalized) {return;}

    this.popUp.confirm(
      'Registros presupuestales',
      '¿Desea confirmar la actualización de los Registros presupuestales seleccionados?',
      'update'
    ).then(result => {
      if (!result.isConfirmed) {return;}

      this.isSubmitting = true;
      this.popUp.loading();

      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/rp_vinculaciones`,
        this.rpsSeleccionados
      )
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.popUp.close();
      }))
      .subscribe({
        next: (response: Respuesta) => {
            if (response.Success) {
              this.isSubmitting = false;
              this.isFinalized = false;
              this.popUp.success('Solicitud enviada. Puedes ver el progreso en el panel           inferior.');

              const jobId =
                (response.Data && (response.Data as any).JobId)
                  ? (response.Data as any).JobId
                  : (response as any).          JobId;

              if (jobId) {
                const key = `jobId_${this.resolucionId}`;
                localStorage.setItem(key,           jobId);
                const event = new CustomEvent('job-iniciado', {
                  detail: { jobId, resolucionId: this.resolucionId },
                });
                window.dispatchEvent(         event);

                console.log(`Nuevo Job iniciado para resolución ${this.resolucionId}: ${jobId}`);
              } else {
                console.warn('No se encontró JobId en la respuesta del MID.');
              }

            } else {
              this.popUp.error('Ha ocurrido un error, comuníquese con el área de soporte.');
            }
          },

        error: () => {
          this.popUp.error('Ha ocurrido un error, comuníquese con el área de soporte.');
        }
      });
    });
  }

  volver(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

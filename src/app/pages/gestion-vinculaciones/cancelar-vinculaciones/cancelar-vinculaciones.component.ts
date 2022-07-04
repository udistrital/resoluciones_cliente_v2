import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { ModificacionResolucion } from 'src/app/@core/models/modificacion_resolucion';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-cancelar-vinculaciones',
  templateUrl: './cancelar-vinculaciones.component.html',
  styleUrls: ['./cancelar-vinculaciones.component.scss']
})
export class CancelarVinculacionesComponent implements OnInit {

  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  modificacionResolucion: ModificacionResolucion;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  vinculacionesSeleccionadas: Vinculaciones[];
  registrosPresupuestales: any;
  cambioVinculacion: CambioVinculacion[];
  numeroSemanas: number;

  constructor(
    private request: RequestManager,
    private router: Router,
    private route: ActivatedRoute,
    private popUp: UtilService,
  ) {
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.vinculacionesData = new LocalDataSource();
    this.vinculacionesSeleccionadas = [];
    this.cambioVinculacion = [];
    this.initTable();
    this.loadData();
  }

  initTable(): void {
    this.vinculacionesSettings = {
      columns: TablaVinculaciones,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
  }

  loadData(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `resolucion/${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          this.resolucion = response.Data as Resolucion;
        });

        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `resolucion_vinculacion_docente/${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          this.resolucionVinculacion = response.Data as ResolucionVinculacionDocente;
        });
        this.popUp.loading();
        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `modificacion_resolucion?limit=0&query=ResolucionNuevaId.Id:${this.resolucionId}`
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.modificacionResolucion = (response.Data as ModificacionResolucion[])[0];
              this.request.get(
                environment.RESOLUCIONES_MID_V2_SERVICE,
                `gestion_vinculaciones/${this.modificacionResolucion.ResolucionAnteriorId.Id}`
              ).subscribe({
                next: (response2: Respuesta) => {
                  if (response2.Success) {
                    this.vinculacionesData.load(response2.Data);
                    this.popUp.close();
                  }
                }, error: () => {
                  this.popUp.close();
                  this.popUp.error('Ha ocurrido un error, comuniquese con el area de soporte.');
                }
              });
            }
          }, error: () => {
            this.popUp.close();
            this.popUp.error('Ha ocurrido un error, comuniquese con el area de soporte.');
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.registrosPresupuestales = {};
  }

  seleccionarVinculaciones(event): void {
    const nueva = event.data as Vinculaciones;
    if (event.isSelected as boolean) {
      const vinculacion = new CambioVinculacion();
      vinculacion.VinculacionOriginal = nueva;
      vinculacion.NumeroSemanas = 0;
      vinculacion.NumeroHorasSemanales = nueva.NumeroHorasSemanales;
      this.cambioVinculacion.push(vinculacion);
      if (!(nueva.PersonaId in this.registrosPresupuestales)) {
        this.registrosPresupuestales[nueva.PersonaId] = [];
      }

      /* TODO: FUNCIONALIDAD DEFINITIVA QUE NO HA SALIDO A PROD
      this.request.get(
        environment.KRONOS_SERVICE,
        `documento_presupuestal/get_info_crp/${nueva.Vigencia}/${nueva.Disponibilidad}/${nueva.PersonaId}`,
      ).subscribe((response: DocumentoPresupuestal[]) => {
        (this.registrosPresupuestales[nueva.PersonaId] as Array<DocumentoPresupuestal>).push(...response);
      });
      */

      /**
       * FUNCIONALIDAD TEMPORAL MIENTRAS kRONOS SALE A PROD
       */
      this.request.get(
        environment.SICAPITAL_JBPM_SERVICE,
        `cdprpdocente/${nueva.Disponibilidad}/${nueva.Vigencia}/${nueva.PersonaId}`
      ).subscribe(response => {
        if (Object.keys(response.cdp_rp_docente).length > 0) {
          (response.cdp_rp_docente.cdp_rp as Array<any>).forEach(rp => {
            const reg = new DocumentoPresupuestal();
            reg.Consecutivo = parseInt(rp.rp, 10);
            reg.Vigencia = parseInt(rp.vigencia, 10);
            reg.Tipo = "rp";
            this.registrosPresupuestales[nueva.PersonaId].push(reg);
          });
        }

      });
    } else {
      const i = this.cambioVinculacion.findIndex(v => v.VinculacionOriginal.Id === nueva.Id);
      this.cambioVinculacion.splice(i, 1);
      delete this.registrosPresupuestales[nueva.PersonaId];
    }
  }

  cancelarVinculaciones(): void {
    for (const cambio of this.cambioVinculacion) {
      cambio.NumeroSemanas = this.numeroSemanas;
    }
    const objetoCancelaciones = {
      CambiosVinculacion: this.cambioVinculacion,
      ResolucionNuevaId: this.resolucionVinculacion,
      ModificacionResolucionId: this.modificacionResolucion.Id,
    };

    this.popUp.confirm(
      'Desvincular docentes',
      '¿Está seguro de realizar la desvinculación de los docentes seleccionados?',
      'create'
    ).then(value => {
      if (value.isConfirmed) {
        this.popUp.loading();
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          'gestion_vinculaciones/desvincular',
          objetoCancelaciones
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.popUp.close();
              this.popUp.success(response.Message);
            }
          }, error: () => {
            this.popUp.close();
            this.popUp.error('No se han podido registrar las cancelaciones.');
          }
        });
      }
    });
  }

  salir(): void {
    this.router.navigateByUrl('pages/gestion_resoluciones');
  }
}

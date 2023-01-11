import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { first, forkJoin } from 'rxjs';
import { RpSelectorComponent } from 'src/app/@core/components/rp-selector/rp-selector.component';
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
    ]).pipe().subscribe({
      next: ([resp1, resp2]: [Respuesta, Respuesta]) => {
        this.resolucion = resp1.Data as Resolucion;
        this.resolucionVinculacion = resp2.Data as ResolucionVinculacionDocente;
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_vinculaciones/${this.resolucionId}`
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.vinculacionesData.load(response.Data);
              this.popUp.close();
            }
          }, error: () => {
            this.popUp.close();
            this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
          }
        });
        this.request.get(
          environment.PARAMETROS_SERVICE,
          `parametro/${this.resolucion.TipoResolucionId}`
        ).subscribe({
          next: (response: Respuesta) => {
            this.tipoResolucion = response.Data as Parametro;
          }, error: () => {
            this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
          }
        });
      }, error: () => {
        this.popUp.close();
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
      }
    });
  }

  initTable(): void {
    const tabla = {...TablaVinculaciones,};
    tabla['RegPres'] = {
      title: 'Registros Presupuestales',
      editable: true,
      width: '15%',
      type: 'custom',
      renderComponent: RpSelectorComponent,
      onComponentInitFunction: (instance: RpSelectorComponent) => {
        instance.event.subscribe((selected: RpSeleccionado) => {
          const i = this.rpsSeleccionados.findIndex(rp => rp.VinculacionId === selected.VinculacionId);
          if (i < 0) {
            this.rpsSeleccionados.push(selected);
          } else {
            if (selected.Consecutivo === undefined) {
              this.rpsSeleccionados.splice(i, 1);
            } else {
              this.rpsSeleccionados.splice(i, 1, selected);
            }
          }
        });
      },
    };

    this.vinculacionesSettings = {
      mode: 'external',
      columns: tabla,
      actions: false,
      selectedRowIndex: -1,
      hideSubHeader: true,
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
  }

  guardar(): void {
    this.popUp.confirm(
      'Registros presupuestales',
      '¿Desea confirmar la actualización de los Registros presupuestales seleccionados?',
      'update'
    ).then(result => {
      if (result.isConfirmed) {
        this.popUp.loading();
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_vinculaciones/rp_vinculaciones`,
          this.rpsSeleccionados
        ).subscribe({
          next: (response: Respuesta) => {
            this.popUp.close();
            if (response.Success) {
              this.popUp.success(response.Message);
            } else {
              this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
            }
          }, error: () => {
            this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
          }
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
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
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  vinculacionesSeleccionadas: Vinculaciones[];

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
  ) {
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.vinculacionesData = new LocalDataSource();
    this.vinculacionesSeleccionadas = [];
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

        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `modificacion_resolucion?limit=0&query=ResolucionNuevaId.Id:${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          if (response.Success) {
            const resolucionId = (response.Data as ModificacionResolucion[])[0].ResolucionAnteriorId.Id;
            this.request.get(
              environment.RESOLUCIONES_MID_V2_SERVICE,
              `gestion_vinculaciones/${resolucionId}`
            ).subscribe((response: Respuesta) => {
              if (response.Success) {
                this.vinculacionesData.load(response.Data);
              }
            });
          }
        });
      }
    });
  }

  ngOnInit(): void {
  }

  seleccionarVinculaciones(event): void {
    this.vinculacionesSeleccionadas = event.selected;
  }

}

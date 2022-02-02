import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-listar-vinculaciones',
  templateUrl: './listar-vinculaciones.component.html',
  styleUrls: ['./listar-vinculaciones.component.scss']
})
export class ListarVinculacionesComponent implements OnInit {

  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  tipoVista: string;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private location: Location,
    private popUp: UtilService,
  ) {
    this.vinculacionesData = new LocalDataSource();
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        this.preloadData()
        this.cargarVinculaciones();
      }
      if (params.get('tipo') !== null) {
        this.tipoVista = params.get('tipo');
      }
      this.initTable();
    });
  }

  preloadData(): void {
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
  }

  initTable(): void {
    this.vinculacionesSettings = {
      mode: 'external',
      columns: TablaVinculaciones,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Opciones',
        custom: [],
      },
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
    switch (this.tipoVista) {
      case 'vista':
        (this.vinculacionesSettings.actions.custom as Array<any>).push(
          {
            name: 'anular',
            title: '<em class="material-icons" title="Anular">cancel</em>'
          }
        );
        break;
      case 'adicion':
        (this.vinculacionesSettings.actions.custom as Array<any>).push(
          {
            name: 'adicionar',
            title: '<em class="material-icons" title="Adicionar">add_circle</em>'
          }
        );
        break;
      case 'reduccion':
        (this.vinculacionesSettings.actions.custom as Array<any>).push(
          {
            name: 'reducir',
            title: '<em class="material-icons" title="Reducir">remove_circle</em>'
          }
        );
        break;
    }
  }

  cargarVinculaciones(): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/${this.resolucionId}`
    ).subscribe((response: Respuesta) => {
      if (response.Success) {
        this.vinculacionesData.load(response.Data);
      }
    });
  }

  eventHandler(event: any): void {
    switch (event.action) {
      case 'anular':
        this.popUp.confirm(
          'Anular vinculacion',
          '¿Desea confirmar la anulación de la vinculación seleccionada?',
          'delete'
        ).then(result => {
          if (result.isConfirmed) {
            this.request.post(
              environment.RESOLUCIONES_MID_V2_SERVICE,
              'gestion_vinculaciones/desvincular_docentes',
              [event.data]
            ).subscribe((response: Respuesta) => {
              if (response.Success) {
                this.popUp.success('Las vinculacion ha sido anulada').then(() => {
                  this.cargarVinculaciones();
                });
              }
            });
          }
        });
        break;
      case 'adicionar':
        break;

      case 'reducir':
        break;
    }
  }

  volver(): void {
    this.location.back();
  }
}

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
import { UtilService } from '../services/utilService';

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

  cadenaFiltro: string[] = [];
  parametros = '';
  query = 'query=Activo:true';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.aprobResolucionesData = new ResolucionesDataSourceComponent(this.http, this.popUp, this.request, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/resoluciones_inscritas?` + this.query + this.parametros,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = {};
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

  filtroTabla(): void {
    this.query = 'query=Activo:true';
    this.parametros = '';
    if (this.cadenaFiltro[0] !== undefined && this.cadenaFiltro[0] !== '') {
      this.query = this.query.concat(',NumeroResolucion:' + this.cadenaFiltro[0]);
    }
    if (this.cadenaFiltro[1] !== undefined && this.cadenaFiltro[1] !== '') {
      this.query = this.query.concat(',Vigencia:' + this.cadenaFiltro[1]);
    }
    if (this.cadenaFiltro[2] !== undefined && this.cadenaFiltro[2] !== '') {
      this.query = this.query.concat(',Periodo=' + this.cadenaFiltro[2]);
    }
    if (this.cadenaFiltro[3] !== undefined && this.cadenaFiltro[3] !== '') {
      this.parametros = this.parametros.concat('&facultad=' + this.cadenaFiltro[3]);
    }
    if (this.cadenaFiltro[4] !== undefined && this.cadenaFiltro[4] !== '') {
      this.parametros = this.parametros.concat('&nivelA=' + this.cadenaFiltro[4]);
    }
    if (this.cadenaFiltro[5] !== undefined && this.cadenaFiltro[5] !== '') {
      this.parametros = this.parametros.concat('&dedicacion=' + this.cadenaFiltro[5]);
    }
    if (this.cadenaFiltro[6] !== undefined && this.cadenaFiltro[6] !== '') {
      this.query = this.query.concat(',NumeroSemanas=' + this.cadenaFiltro[6]);
    }
    if (this.cadenaFiltro[7] !== undefined && this.cadenaFiltro[7] !== '') {
      this.parametros = this.parametros.concat('&estadoRes=' + this.cadenaFiltro[7]);
    }
    if (this.cadenaFiltro[8] !== undefined && this.cadenaFiltro[8] !== '') {
      this.parametros = this.parametros.concat('&tipoRes=' + this.cadenaFiltro[8]);
    }
    this.ngOnInit();
  }

  limpiarFiltro(): void {
    for (let i in this.cadenaFiltro) {
      i = '';
    }
    this.ngOnInit();
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
                this.ngOnInit();
              });
            }
          }, error: () => {
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
      }, error: () => {
        this.popUp.error('No se ha podido generar la resolución.');
      }
    });
  }

}

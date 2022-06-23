import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { ActionsAssistanceComponent } from 'src/app/@core/components/actions-assistance/actions-assistance.component';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ExpedirVinculacionComponent } from './expedir-vinculacion/expedir-vinculacion.component';
import { ExpedirModificacionComponent } from './expedir-modificacion/expedir-modificacion.component';
import { ExpedirCancelacionComponent } from './expedir-cancelacion/expedir-cancelacion.component';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ModalDocumentoViewerComponent } from '../modal-documento-viewer/modal-documento-viewer.component';
import { UtilService } from '../services/utilService';


@Component({
  selector: 'app-admin-resoluciones',
  templateUrl: './admin-resoluciones.component.html',
  styleUrls: ['./admin-resoluciones.component.scss']
})
export class AdminResolucionesComponent implements OnInit {

  dialogConfig: MatDialogConfig;
  icono: string;

  cadenaFiltro: string[] = [];

  adminResolucionesSettings: any;
  adminResolucionesData: ResolucionesDataSourceComponent;
  parametros = '';
  query = 'query=Activo:true';

  constructor(
    private request: RequestManager,
    private dialog: MatDialog,
    private http: HttpClient,
    private popUp: UtilService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.adminResolucionesData = new ResolucionesDataSourceComponent(this.http, this.popUp, this.request, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/resoluciones_aprobadas?` + this.query + this.parametros,
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
        instance.modulo = 'admin';
        instance.icon.subscribe((res: string) => {
          this.icono = res;
        });
        instance.data.subscribe((data: Resoluciones) => {
          this.eventHandler(this.icono, data);
        });
      },
    };

    this.adminResolucionesSettings = {
      columns: TablaResolucion,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
      noDataMessage: 'No hay resoluciones aprobadas en el sistema',
    };

    this.cadenaFiltro.forEach((value: string) => {
      value = '';
    });
  }

  eventHandler(event: string, rowData: Resoluciones): void {
    switch (event) {
      case 'documento':
        this.cargarDocumento(rowData);
        break;
      case 'expedicion':
        this.expedirVista(rowData);
        break;
    }
  }

  filtroTabla(): void {
    this.query = 'query=Activo:true';
    this.parametros = '';
    if (this.cadenaFiltro[0] !== undefined && this.cadenaFiltro[0] !== '') {
      this.query = this.query.concat(',ResolucionId.NumeroResolucion:' + this.cadenaFiltro[0]);
    }
    if (this.cadenaFiltro[1] !== undefined && this.cadenaFiltro[1] !== '') {
      this.query = this.query.concat(',ResolucionId.Vigencia:' + this.cadenaFiltro[1]);
    }
    if (this.cadenaFiltro[2] !== undefined && this.cadenaFiltro[2] !== '') {
      this.parametros = this.parametros.concat('&facultad=' + this.cadenaFiltro[2]);
    }
    if (this.cadenaFiltro[3] !== undefined && this.cadenaFiltro[3] !== '') {
      this.parametros = this.parametros.concat('&tipoRes=' + this.cadenaFiltro[3]);
    }
    if (this.cadenaFiltro[4] !== undefined && this.cadenaFiltro[4] !== '') {
      this.parametros = this.parametros.concat('&nivelA=' + this.cadenaFiltro[4]);
    }
    if (this.cadenaFiltro[5] !== undefined && this.cadenaFiltro[5] !== '') {
      this.parametros = this.parametros.concat('&dedicacion=' + this.cadenaFiltro[5]);
    }
    if (this.cadenaFiltro[6] !== undefined && this.cadenaFiltro[6] !== '') {
      this.parametros = this.parametros.concat('&estadoRes=' + this.cadenaFiltro[6]);
    }
    this.ngOnInit();
  }

  limpiarFiltro(): void {
    for (let i in this.cadenaFiltro) {
      i = '';
    }
    this.ngOnInit();
  }

  cargarDocumento(rowData: Resoluciones): void {
    this.popUp.loading();
    if (rowData.Estado === 'Expedida') {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion/${rowData.Id}`
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            const resolucion = response.Data as Resolucion;
            this.request.get(
              environment.GESTOR_DOCUMENTAL_SERVICE,
              `document/${resolucion.NuxeoUid}`
            ).subscribe({
              next: response2 => {
                this.popUp.close();
                this.dialogConfig.data = response2.file as string;
                this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
              }, error: () => {
                this.popUp.close();
                this.popUp.error('No se ha podido generar la resolución.');
              }
            });
          }
        }, error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resolución.');
        }
      });
    } else {
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
          this.popUp.close();
          this.popUp.error('No se ha podido generar la resolución.');
        }
      });
    }
  }

  expedirVista(rowData: Resoluciones): void {
    const cadena = rowData.TipoResolucion.replace('Resolución de ', '');
    console.log(cadena);
    let dialogo: MatDialogRef<any>;
    this.dialogConfig.data = rowData;
    switch (cadena) {
      case 'Vinculación':
        dialogo = this.dialog.open(ExpedirVinculacionComponent, this.dialogConfig);
        break;
      case 'Adición':
      case 'Reducción':
        dialogo = this.dialog.open(ExpedirModificacionComponent, this.dialogConfig);
        break;
      case 'Cancelación':
        dialogo = this.dialog.open(ExpedirCancelacionComponent, this.dialogConfig);
        break;
    }
    dialogo.afterClosed().subscribe((resp: boolean) => {
      if (resp) {
        this.ngOnInit();
      }
    });
  }

}

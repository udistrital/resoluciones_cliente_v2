import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { CheckboxAssistanceComponent } from 'src/app/@core/components/checkbox-assistance/checkbox-assistance.component';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';


@Component({
  selector: 'app-admin-resoluciones',
  templateUrl: './admin-resoluciones.component.html',
  styleUrls: ['./admin-resoluciones.component.scss']
})
export class AdminResolucionesComponent implements OnInit {

  tipoResVista = '';
  rowData: any;
  icono: string;

  cadenaFiltro: string[] = [];

  adminResolucionesSettings: any;
  adminResolucionesData: ResolucionesDataSourceComponent;
  resolucionAprobada: any;

  resolucionAprobadaId: number;
  parametros: string = "";
  query: string = "query=Activo:true";

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private router: Router,
    private http: HttpClient,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.adminResolucionesData = new ResolucionesDataSourceComponent(this.http, this.request, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/resoluciones_aprobadas?` + this.query + this.parametros,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
  }

  initTable(): void {
    TablaResolucion["Acciones"] = {
      title: "Acciones",
      editable: true,
      filter: false,
      width: '4%',
      type: 'custom',
      renderComponent: CheckboxAssistanceComponent,
      onComponentInitFunction: (instance) => {
        console.log("...Component...");
        instance.modulo = "admin";
        instance.icon.subscribe(res => {
          this.icono = res;
        });
        instance.data.subscribe(data => {
          this.eventHandler(this.icono, data);
        });
      },
    }

    this.adminResolucionesSettings = {
      columns: TablaResolucion,
      mode: 'external',
      actions: false,
      rowClassFunction: (row: any) => {
      },
      noDataMessage: 'No hay resoluciones aprobadas en el sistema',
    };

    this.cadenaFiltro.forEach(function (value) {
      value = "";
    });
  }

  eventHandler(event: string, rowData: any): void {
    console.log("...EventHandler...");
    console.log("event: ", event);
    switch (event) {
      case 'documento':
        console.log("documento");
        if (this.tipoResVista !== "") {
          this.tipoResVista = "";
        }
        // this.cargarDocumento(0);
        break;
      case 'expedicion':
        if (this.tipoResVista === "") {
          this.expedirVista(rowData);
        } else {
          this.tipoResVista = "";
        }
        break;
    }
  }

  filtroTabla() {

    this.query = "query=Activo:true";
    this.parametros = "";
    if (this.cadenaFiltro[0] !== undefined && this.cadenaFiltro[0] !== "") {
      this.query = this.query.concat(",ResolucionId.NumeroResolucion:" + this.cadenaFiltro[0]);
    }
    if (this.cadenaFiltro[1] !== undefined && this.cadenaFiltro[1] !== "") {
      this.query = this.query.concat(",ResolucionId.Vigencia:" + this.cadenaFiltro[1]);
    }
    if (this.cadenaFiltro[2] !== undefined && this.cadenaFiltro[2] !== "") {
      this.parametros = this.parametros.concat("&facultad=" + this.cadenaFiltro[2]);
    }
    if (this.cadenaFiltro[3] !== undefined && this.cadenaFiltro[3] !== "") {
      this.parametros = this.parametros.concat("&tipoRes=" + this.cadenaFiltro[3]);
    }
    if (this.cadenaFiltro[4] !== undefined && this.cadenaFiltro[4] !== "") {
      this.parametros = this.parametros.concat("&nivelA=" + this.cadenaFiltro[4]);
    }
    if (this.cadenaFiltro[5] !== undefined && this.cadenaFiltro[5] !== "") {
      this.parametros = this.parametros.concat("&dedicacion=" + this.cadenaFiltro[5]);
    }
    if (this.cadenaFiltro[6] !== undefined && this.cadenaFiltro[6] !== "") {
      this.parametros = this.parametros.concat("&estadoRes=" + this.cadenaFiltro[6]);
    }
    this.ngOnInit();
  }

  limpiarFiltro() {
    for (let i in this.cadenaFiltro) {
      i = "";
    }
    this.ngOnInit();
  }

  cargarDocumento(id: number): void {

  }

  expedirResolucion(id: number): void {
    console.info("Aquí entra en la función expedirResolucion");
  }

  expedirVista(rowData: any): void {
    var cadena = (rowData.TipoResolucion).slice(0, -3);
    console.log(cadena);
    this.resolucionAprobada = rowData;
    this.resolucionAprobadaId = rowData.Id;
    switch (rowData.TipoResolucion) {
      case 'Resolución de Vinculación':
        this.tipoResVista = 'Vinculacion';
        break;
      case 'Resolución de Modificacion':
        this.tipoResVista = 'Modificacion';
        break;
      case 'Resolución de Cancelación':
        this.tipoResVista = 'Cancelación';
        break;
    }

  }
  expedirCancelacion(): void {

  }
  expedirModificacion(): void {
  }

}

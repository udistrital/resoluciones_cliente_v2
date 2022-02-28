import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerDataSource } from 'ng2-smart-table';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';


@Component({
  selector: 'app-admin-resoluciones',
  templateUrl: './admin-resoluciones.component.html',
  styleUrls: ['./admin-resoluciones.component.scss']
})
export class AdminResolucionesComponent implements OnInit {

  tipoResVista = '';

  adminResolucionesSettings: any;
  adminResolucionesData: ServerDataSource;
  resolucionAprobada;
  resolucionAprobadaId = 101010101;
  iconoAccion: string;

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
    this.adminResolucionesData = new ServerDataSource(this.http, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/get_resoluciones_aprobadas`,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
  }

  initTable(): void {
    this.adminResolucionesSettings = {
      columns: TablaResolucion,
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'documento',
            title: '<em class="material-icons" title="Ver Documento">description</em>'
          },
          {
            name: 'expedicion',
            title: '<em class="material-icons" title="Expedir">note_add</em>'
          },
        ],
      },
      rowClassFunction: (row: any) => {
      },
      noDataMessage: 'No hay resoluciones aprobadas en el sistema',
    };
  }


  eventHandler(event: any): void {
    switch (event.action) {
      case 'documento':
        this.tipoResVista = '';
        // this.cargarDocumento(event.data.Id);
        break;
      case 'expedicion':
        console.log("tipoResVista: ", this.tipoResVista);
        console.log("TipoResolucion: ", event.data.TipoResolucion);
        if (this.tipoResVista === event.data.TipoResolucion) {
          console.log("Debe cancelar la otra xd");
        } else {
          this.tipoResVista = event.data.TipoResolucion;
          this.resolucionAprobadaId = event.data.Id;
          this.resolucionAprobada = event.data;
        }
        break;
    }
  }

  cargarDocumento(id: number): void {

  } 

  expedirResolucion(id: number): void {
    console.info("Aquí entra en la función expedirResolucion");
  }

  expedirResolucion2(): void {
    
  }
  expedirResolucion3(): void {
    this.tipoResVista = 'Cancelacion';
  }
  expedirResolucion4(): void {
    this.tipoResVista = 'Modificacion';
  }

}

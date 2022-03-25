import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ServerDataSource } from 'ng2-smart-table';
import { CheckboxAssistanceComponent } from 'src/app/@core/components/checkbox-assistance/checkbox-assistance.component';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../services/requestManager';

@Component({
  selector: 'app-aprobacion-resoluciones',
  templateUrl: './aprobacion-resoluciones.component.html',
  styleUrls: ['./aprobacion-resoluciones.component.scss']
})
export class AprobacionResolucionesComponent implements OnInit {

  aprobResolucionesSettings: any;
  aprobResolucionesData: ServerDataSource;

  cadenaFiltro: string[] = [];
  parametros: string = "";
  query = "query=Activo:true";

  CurrentDate = new Date();

  constructor(
    private http: HttpClient,
    private request: RequestManager
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.aprobResolucionesData = new ServerDataSource(this.http, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones`,
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
        instance.modulo = "aprob";
        instance.icon.subscribe(data => {
          this.eventHandler(data);
        });
      },
    }

    this.aprobResolucionesSettings = {
      columns: TablaResolucion,
      mode: 'external',
      actions: false,
      rowClassFunction: (row: any) => {
      },
      noDataMessage: 'No hay resoluciones inscritas en el sistema',
    };
  }

  eventHandler(event): void {
    switch (event) {
      case 'documento':
        break;
      case 'aprobacion':
        this.verModificarEstado(event.data, "APROBADA", 5);
        break;
      case 'desaprobacion':
        this.verModificarEstado(event.data, "DESAPROBADA", 1);
        break;
    }
  }

  filtroTabla() {
    this.query = "query=Activo:true";
    this.parametros = "";
    if (this.cadenaFiltro[0] !== undefined && this.cadenaFiltro[0] !== "") {
      this.query = this.query.concat(",NumeroResolucion:" + this.cadenaFiltro[0]);
    }
    if (this.cadenaFiltro[1] !== undefined && this.cadenaFiltro[1] !== "") {
      this.query = this.query.concat(",Vigencia:" + this.cadenaFiltro[1]);
    }
    if (this.cadenaFiltro[2] !== undefined && this.cadenaFiltro[2] !== "") {
      this.query = this.query.concat(",Periodo=" + this.cadenaFiltro[2]);
    }
    if (this.cadenaFiltro[3] !== undefined && this.cadenaFiltro[3] !== "") {
      this.parametros = this.parametros.concat("&facultad=" + this.cadenaFiltro[3]);
    }
    if (this.cadenaFiltro[4] !== undefined && this.cadenaFiltro[4] !== "") {
      this.parametros = this.parametros.concat("&nivelA=" + this.cadenaFiltro[4]);
    }
    if (this.cadenaFiltro[5] !== undefined && this.cadenaFiltro[5] !== "") {
      this.parametros = this.parametros.concat("&dedicacion=" + this.cadenaFiltro[5]);
    }
    if (this.cadenaFiltro[6] !== undefined && this.cadenaFiltro[6] !== "") {
      this.query = this.query.concat(",NumeroSemanas=" + this.cadenaFiltro[6]);
    }
    if (this.cadenaFiltro[7] !== undefined && this.cadenaFiltro[7] !== "") {
      this.parametros = this.parametros.concat("&estadoRes=" + this.cadenaFiltro[7]);
    }
    if (this.cadenaFiltro[8] !== undefined && this.cadenaFiltro[8] !== "") {
      this.parametros = this.parametros.concat("&tipoRes=" + this.cadenaFiltro[8]);
    }
    this.ngOnInit();
  }

  limpiarFiltro() {

  }

  verModificarEstado(row, nombreEstado, idEstado) {
    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      "resolucion/" + row.Id
    ).subscribe((response: Respuesta) => {
      var Resolucion = response.Data;
      var resolucion_estado = {
        FechaCreacion: this.CurrentDate,
        Usuario: "",
        EstadoResolucionId: {
          Id: idEstado,
        },
        ResolucionId: Resolucion,
        Activo: true,
      };
      Swal.fire({
        title: "¿Seguro de que desea que la resolución sea " + nombreEstado + "?",
        html:
          'Número de resolución<br>' +
          Resolucion.NumeroResolucion,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false
      }).then(function () {
        this.cambiarEstado(resolucion_estado, nombreEstado);
      });
    });
  }

  verRestaurarResolucion(row) {
    Swal.fire({
      title: "¿Restaurar la resolución?",
      html: '<p><b>Número: </b>' + row.Numero.toString() + '</p>' +
        '<p><b>Facultad: </b>' + row.Facultad + '</p>' +
        '<p><b>Nivel académico: </b>' + row.NivelAcademico + '</p>' +
        '<p><b>Dedicación: </b>' + row.Dedicacion + '</p>',
      icon: 'success',
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: 'button-submit',
        cancelButton: 'button-remove'
      },
      buttonsStyling: false,
      allowOutsideClick: false
    }).then(function () {
      this.restaurarResolucion(row);
    }, function (dismiss) {
      if (dismiss) {
        Swal.fire({
          text: "No se ha realizado la restauración de la resolución",
          icon: "error"
        });
      }
    });
  }

  restaurarResolucion(row) {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      "resolucion/" + row.Id
    ).subscribe((response: Respuesta) => {
      var nuevaResolucion = response.Data;
      //Cambio de estado y fecha de expedicion de la resolucion en caso de que ya hubiese sido expedida.
      nuevaResolucion.Activo = true;
      nuevaResolucion.FechaExpedicion = null;
      //Se actualizan los datos de la resolución
      this.request.put(
        environment.RESOLUCIONES_V2_SERVICE,
        "resolucion/RestaurarResolucion",
        nuevaResolucion.Id,
        nuevaResolucion
      ).subscribe((response2: Respuesta) => {
        if (response2.Data.Success) {
          this.aprobResolucionesData.refresh();
        }
      });
    });
  }

  cambiarEstado(resolucion_estado, estadoNuevo) {
    this.request.post(
      environment.RESOLUCIONES_V2_SERVICE,
      "resolucion_estado",
      resolucion_estado
    ).subscribe((response: Respuesta) => {
      if (response.Data.Success) {
        Swal.fire(
          'Felicidades',
          estadoNuevo,
          'success'
        ).then(function () {
          window.location.reload();
        });
      } else {
        Swal.fire(
          'Error',
          'Ocurrió un error',
          'error'
        );
      }
    });
  }

}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ServerDataSource } from 'ng2-smart-table';
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

  CurrentDate = new Date();
  offset = 0;
  query = "";

  constructor(
    private http: HttpClient,
    private request: RequestManager
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.aprobResolucionesData = new ServerDataSource(this.http, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/get_resoluciones_inscritas`,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
  }

  initTable(): void {
    this.aprobResolucionesSettings = {
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
            name: 'aprobacion',
            title: '<em class="material-icons" title="Aprobar">done_outline</em>'
          },
          {
            name: 'desaprobacion',
            title: '<em class="material-icons" title="Desaprobar">block</em>'
          }
        ],
      },
      rowClassFunction: (row: any) => {
      },
      noDataMessage: 'No hay resoluciones inscritas en el sistema',
    };
  }

  eventHandler(event: any): void {
    switch (event.action) {
      case 'documento':

        break;
      case 'aprobacion':
        this.verModificarEstado(event.data, "APROBADA", 5);
        break;
      case 'desaprobacion':
        this.verModificarEstado(event.data, "DESAPROBADA", 5);
        break;
    }
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

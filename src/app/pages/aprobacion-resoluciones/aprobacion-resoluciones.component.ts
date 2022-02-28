import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ServerDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';

@Component({
  selector: 'app-aprobacion-resoluciones',
  templateUrl: './aprobacion-resoluciones.component.html',
  styleUrls: ['./aprobacion-resoluciones.component.scss']
})
export class AprobacionResolucionesComponent implements OnInit {

  aprobResolucionesSettings: any;
  aprobResolucionesData: ServerDataSource;

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

        break;
    }
  }

  cargarDatosResolucion(offset, query) {
    if (query === undefined) {
      query = "";
    }
    var req = this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      "gestion_resoluciones/get_resoluciones_inscritas?limit=10&offset=" + offset + "&query=" + typeof (query) === "string" ? query: query.join(",")
    ).subscribe((response: Respuesta) => {
      return req
    });

  }

  funcion() {

    // self.cargarDatosResolucion = function (offset, query) {
    //   if (query === undefined) { query = ""; }
    //   var req = resolucionesMidRequest.get("gestion_resoluciones/get_resoluciones_inscritas", $.param({
    //     limit: self.resolucionesInscritas.paginationPageSize,
    //     offset: offset,
    //     query: typeof (query) === "string" ? query : query.join(",")
    //   }), true);
    //   req.then(gridApiService.paginationFunc(self.resolucionesInscritas, offset));
    //   return req;
    // };

    // //Función para realizar la aprobación de la resolución
    // $scope.verModificarEstado = function (row, nombreEstado, idEstado) {
    //   resolucionRequest.get("resolucion/" + row.entity.Id).then(function (response) {
    //     var Resolucion = response.data.Data;
    //     var resolucion_estado = {
    //       FechaCreacion: self.CurrentDate,
    //       Usuario: "",
    //       EstadoResolucionId: {
    //         Id: idEstado,
    //       },
    //       ResolucionId: Resolucion,
    //       Activo: true,
    //     };
    //     swal({
    //       title: $translate.instant('CONFIRMAR_' + nombreEstado),
    //       html:
    //         $translate.instant('NUMERO_RESOLUCION') + '<br>' +
    //         Resolucion.NumeroResolucion,
    //       type: 'question',
    //       showCancelButton: true,
    //       confirmButtonColor: '#3085d6',
    //       cancelButtonColor: '#d33',
    //       confirmButtonText: $translate.instant(nombreEstado + '_BTN'),
    //       cancelButtonText: $translate.instant('CANCELAR'),
    //       allowOutsideClick: false
    //     }).then(function () {
    //       self.cambiarEstado(resolucion_estado, nombreEstado);
    //     });
    //   });
    // };


    // //Función donde se despliega un mensaje de alerta previo a la restauración de la resolución
    // $scope.verRestaurarResolucion = function (row) {
    //   swal({
    //     title: $translate.instant('PREGUNTA_RESTAURAR'),
    //     html: '<p><b>Número: </b>' + row.entity.Numero.toString() + '</p>' +
    //       '<p><b>Facultad: </b>' + row.entity.Facultad + '</p>' +
    //       '<p><b>Nivel académico: </b>' + row.entity.NivelAcademico + '</p>' +
    //       '<p><b>Dedicación: </b>' + row.entity.Dedicacion + '</p>',
    //     type: 'success',
    //     showCancelButton: true,
    //     confirmButtonText: $translate.instant('ACEPTAR'),
    //     cancelButtonText: $translate.instant('CANCELAR'),
    //     confirmButtonClass: 'btn btn-success',
    //     cancelButtonClass: 'btn btn-danger',
    //     buttonsStyling: false,
    //     allowOutsideClick: false
    //   }).then(function () {
    //     self.restaurarResolucion(row);
    //   }, function (dismiss) {
    //     if (dismiss === 'cancel') {
    //       swal({
    //         text: $translate.instant('NO_RESTAURACION_RESOLUCION'),
    //         type: 'error'
    //       });
    //     }
    //   });
    // };

    // //Función para asignar controlador de la vista resolucion_vista.html, donde se pasa por parámetro el id de la resolucion seleccionada con ayuda de $mdDialog
    // $scope.verVisualizarResolucion = function (row) {

    //   var resolucion = {
    //     Id: row.entity.Id,
    //     Numero: row.entity.Numero,
    //     NivelAcademico: row.entity.NivelAcademico,
    //     FacultadId: row.entity.Facultad,
    //     Vigencia: row.entity.Vigencia,
    //     Periodo: row.entity.Periodo,
    //     NumeroSemanas: row.entity.NumeroSemanas,
    //     Dedicacion: row.entity.Dedicacion,
    //     FacultadNombre: row.entity.FacultadNombre,
    //     FechaExpedicion: row.entity.FechaExpedicion,
    //     TipoResolucion: row.entity.TipoResolucion,
    //     IdDependenciaFirma: row.entity.IdDependenciaFirma,
    //     FacultadFirmaNombre: row.entity.FacultadFirmaNombre,
    //     Estado: row.entity.Estado
    //   };

    //   var local = JSON.stringify(resolucion);
    //   localStorage.setItem('resolucion', local);

    //   $mdDialog.show({
    //     controller: "ResolucionVistaCtrl",
    //     controllerAs: 'resolucionVista',
    //     templateUrl: 'views/vinculacionespecial/resolucion_vista.html',
    //     parent: angular.element(document.body),
    //     clickOutsideToClose: true,
    //     fullscreen: true,

    //   });
    // };

    // //Función para realizar la restauración y verificación de la resolución
    // self.restaurarResolucion = function (row) {
    //   resolucionRequest.get("resolucion/" + row.entity.Id).then(function (response) {
    //     var nuevaResolucion = response.data.Data;
    //     //Cambio de estado y fecha de expedicion de la resolucion en caso de que ya hubiese sido expedida.
    //     nuevaResolucion.Activo = true;
    //     nuevaResolucion.FechaExpedicion = null;
    //     //Se actualizan los datos de la resolución
    //     resolucionRequest.put("resolucion/RestaurarResolucion", nuevaResolucion.Id, nuevaResolucion).then(function (response2) {
    //       if (response2.data.Success) {
    //         self.cargarDatosResolucion(self.offset, self.query);
    //       }
    //     });
    //   });
    // };


    // //Se hace el llamado de la función para cargar datos de resoluciones
    // self.cargarDatosResolucion(self.offset, self.query);


    // //Función para cambiar el estado de la resolución
    // self.cambiarEstado = function (resolucion_estado, estadoNuevo) {
    //   resolucionRequest.post("resolucion_estado", resolucion_estado).then(function (response) {
    //     if (response.data.Success) {
    //       self.cargarDatosResolucion(self.offset, self.query);
    //       swal(
    //         'Felicidades',
    //         $translate.instant(estadoNuevo),
    //         'success'
    //       ).then(function () {
    //         $window.location.reload();
    //       });
    //     } else {
    //       swal(
    //         'Error',
    //         'Ocurrió un error',
    //         'error'
    //       );
    //     }
    //   });
    // };
  }

}

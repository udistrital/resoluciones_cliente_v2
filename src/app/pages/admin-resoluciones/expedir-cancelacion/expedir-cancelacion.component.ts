import { HttpClient } from '@angular/common/http';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResolucion } from 'src/app/@core/models/tabla_resolucion';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-expedir-cancelacion',
  templateUrl: './expedir-cancelacion.component.html',
  styleUrls: ['./expedir-cancelacion.component.scss']
})
export class ExpedirCancelacionComponent implements OnInit {

  @Input() idResolucionC: number;
  @Input() resolucion: any;

  @Output() cancelarCancelacion = new EventEmitter<string>();

  adminCancelacionData: ResolucionesDataSourceComponent;
  adminCancelacionsettings: any;

  contratoCanceladoBase: any = {};
  estado = false;
  cantidad = 0;
  maximoSemanas = 0;
  semanasTranscurridas = 0;
  fechaActa = new Date();
  fecha_actual = new Date();
  fechaFinal = new Date();
  esconderBoton = false;
  FechaExpedicion = null;
  contratados: any;
  ordenadorGasto: any;
  resolucionActual: any;

  vigencia: string;
  fechaExpedicion: Date;

  constructor(
    private http: HttpClient,
    private request: RequestManager
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.adminCancelacionData = new ResolucionesDataSourceComponent(this.http, this.request, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + ``,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
    this.cargarDatos();
  }

  initTable() {
    this.adminCancelacionsettings = {
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
        break;
      case 'expedicion':
        break;
    }
  }

  cargarDatos() {

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/` + this.idResolucionC
    ).subscribe((response: Respuesta) => {
      this.resolucionActual = response.Data;
      if (this.resolucionActual.FechaExpedicion !== undefined && this.resolucionActual.FechaExpedicion !== "0001-01-01T00:00:00Z") {
        this.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      }
      this.maximoSemanas = this.resolucionActual.NumeroSemanas;
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `tipo_resolucion` + this.resolucionActual.TipoResolucionId.Id
      ).subscribe((responseTipoRes: Respuesta) => {
        this.resolucionActual.TipoResolucionId.NombreTipoResolucion = response.Data.NombreTipoResolucion;
        ///////////////////////////////////////////////////////////DOCUMENTO//////////////////////////////////////////////////////
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_documento_resolucion/get_contenido_resolucion?id_resolucion=` + this.resolucionActual.Id + `&id_facultad=` + this.resolucionActual.DependenciaFirmaId
        ).subscribe((response2: Respuesta) => {
          var contenidoResolucion = response2.Data;
        });
        ///////////////////////////////////////////////////////////DOCUMENTO//////////////////////////////////////////////////////
      });
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion_vinculacion_docente/` + this.idResolucionC
    ).subscribe((response: Respuesta) => {
      var datosFiltro = response.Data;
      this.request.get(
        environment.OIKOS_SERVICE,
        `dependencia/` + datosFiltro.FacultadId.toString()
      ).subscribe((response2: Respuesta) => {
        var sede_solicitante_defecto = response2.Data.Nombre;
      });
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_desvinculaciones/docentes_cancelados?id_resolucion=` + this.idResolucionC.toString()
      ).subscribe((response3: Respuesta) => {
        this.contratados = response3.Data;
        var jsn = JSON.parse(JSON.stringify(this.contratados));
        this.cantidad = Object.keys(jsn).length;
        this.request.get(
          environment.ADMIN_AMAZON_SERVICE,
          `acta_inicio?NumeroContrato:` + this.contratados[0].NumeroContrato + `,Vigencia` + this.contratados[0].Vigencia
        ).subscribe((response4: Respuesta) => {
          var acta = response4.Data[0];
        });
      });

      this.request.get(
        environment.OIKOS_SERVICE,
        `dependencia/proyectosPorFacultad/` + this.resolucion.Facultad + "/" + datosFiltro.NivelAcademico
      ).subscribe((response2: Respuesta) => {
        var proyectos = response2.Data;
      });
      this.request.get(
        environment.CORE_AMAZON_SERVICE,
        `ordenador_gasto?query=DependenciaId:` + datosFiltro.FacultadId.toString()
      ).subscribe((response2: Respuesta) => {
        if (response2.Data === null) {
          this.request.get(
            environment.CORE_AMAZON_SERVICE,
            `ordenador_gasto/1`
          ).subscribe((response3: Respuesta) => {
            this.ordenadorGasto = response3.Data;
          });
        } else {
          this.ordenadorGasto = response2.Data[0];
        }
      });
    });
  }

  asignarValoresDefecto() {
    this.contratoCanceladoBase.Usuario = "";
    this.contratoCanceladoBase.Estado = true;
  }

  cancelarContrato() {
    this.asignarValoresDefecto();
    if (this.FechaExpedicion && this.contratoCanceladoBase.MotivoCancelacion) {
      Swal.fire({
        title: "¿Expedir la resolución?",
        icon: 'question',
        text: "¿Está seguro que desea expedir la resolución?",
        html: '<p><b> Número: </b>' + this.resolucion.Numero.toString() + '</p>' +
          '<p><b> Facultad: </b>' + this.resolucion.FacultadNombre + '</p>' +
          '<p><b> Nivel académico: </b>' + this.resolucion.NivelAcademico + '</p>' +
          '<p><b> Dedicación: </b>' + this.resolucion.Dedicacion + '</p>' +
          '<p><b> Número de vinculaciones canceladas: </b>' + this.cantidad + '</p>',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'button-submit',
          cancelButton: 'button-remove'
        },
        buttonsStyling: false,
        allowOutsideClick: false
      }).then((result) => {
        if (this.FechaExpedicion && this.contratoCanceladoBase.MotivoCancelacion) {
          this.expedirCancelar();
        } else {
          Swal.fire({
            text: 'Complete todos Los campos',
            icon: 'error'
          });
        }
      }, function (dismiss) {
        if (dismiss === 'cancel') {
          Swal.fire({
            text: 'No se ha realizado la expedición de la resolución',
            icon: 'error'
          });
        }
      }
      );
    } else {
      Swal.fire({
        text: 'Complete todos Los campos',
        icon: 'warning'
      });
    }
  }

  expedirCancelar() {
    this.estado = true;
    this.esconderBoton = true;
    var conjuntoContratos = [];
    if (this.contratados) {
      this.contratados.forEach(contratado => {
        var contratoCancelado = JSON.parse(JSON.stringify(this.contratoCanceladoBase));
        contratoCancelado.NumeroContrato = contratado.NumeroContrato.String;
        contratoCancelado.Vigencia = contratado.Vigencia;
        var CancelacionContrato = {
          ContratoCancelado: contratoCancelado,
          VinculacionDocente: {
            Id: parseInt(contratado.Id),
            NumeroSemanasNuevas: contratado.NumeroSemanasNuevas
          }
        };
        conjuntoContratos.push(CancelacionContrato);
      });
      var expedicionResolucion = {
        Vinculaciones: conjuntoContratos,
        idResolucion: this.idResolucionC,
        FechaExpedicion: this.FechaExpedicion
      };
      this.resolucion.FechaExpedicion = this.FechaExpedicion;
      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `expedir_resolucion/cancelar`,
        expedicionResolucion
      ).subscribe((response) => {
        this.estado = false;
        this.guardarResolucionNuxeo();
      });
    } else {
      Swal.fire({
        text: 'No hay docentes inscritos dentro de la resolución',
        title: 'Alerta',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        showLoaderOnConfirm: true,
        allowOutsideClick: false
      });
    }
  }

  guardarResolucionNuxeo() {

  }

  cancelarExpedicion() {
    this.cancelarCancelacion.emit('');
  }

}

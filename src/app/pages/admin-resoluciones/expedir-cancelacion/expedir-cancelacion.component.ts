import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResolucionesDataSourceComponent } from 'src/app/@core/components/resoluciones-data-source/resoluciones-data-source.component';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaPrevinculacion } from 'src/app/@core/models/tabla_previnculacion';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-expedir-cancelacion',
  templateUrl: './expedir-cancelacion.component.html',
  styleUrls: ['./expedir-cancelacion.component.scss']
})
export class ExpedirCancelacionComponent implements OnInit {

  @Input() idResolucionC: number;
  resolucion: Resoluciones;

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
  contratados: any;
  ordenadorGasto: any;
  sede_solicitante_defecto: any;
  resolucionActual: any;

  FechaExpedicion = null;
  numeroRes: string;
  tipoResolucion: string;
  numeroSemanas: number;

  vigencia: string;
  fechaExpedicion: Date;

  constructor(
    private http: HttpClient,
    private request: RequestManager,
    private popUp: UtilService,
    public dialogRef: MatDialogRef<ExpedirCancelacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Resoluciones,
  ) {
    this.resolucion = this.data;
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
      columns: TablaPrevinculacion,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
      noDataMessage: 'No hay resoluciones aprobadas en el sistema',
    };
  }

  cargarDatos() {

    this.tipoResolucion = this.resolucion.TipoResolucion;
    this.numeroRes = this.resolucion.NumeroResolucion;

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.resolucionActual = response.Data;
      if (this.resolucionActual.FechaExpedicion !== undefined && this.resolucionActual.FechaExpedicion !== '0001-01-01T00:00:00Z') {
        this.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      }
      this.maximoSemanas = this.resolucionActual.NumeroSemanas;
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion_vinculacion_docente/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      var datosFiltro = response.Data;
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_desvinculaciones/docentes_cancelados?id_resolucion=` + this.idResolucionC.toString()
      ).subscribe((response3: Respuesta) => {
        this.contratados = response3.Data;
        var jsn = JSON.parse(JSON.stringify(this.contratados));
        this.cantidad = Object.keys(jsn).length;
        this.request.get(
          environment.ADMIN_AMAZON_SERVICE,
          `acta_inicio?NumeroContrato:${this.contratados[0].NumeroContrato},Vigencia:${this.contratados[0].Vigencia}`
        ).subscribe((response4: Respuesta) => {
          var acta = response4.Data[0];
        });
      });

      this.request.get(
        environment.OIKOS_SERVICE,
        `dependencia/proyectosPorFacultad/` + this.resolucion.Facultad + '/' + datosFiltro.NivelAcademico
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
    this.contratoCanceladoBase.Usuario = '';
    this.contratoCanceladoBase.Estado = true;
  }

  cancelarContrato() {
    this.asignarValoresDefecto();
    if (this.FechaExpedicion && this.contratoCanceladoBase.MotivoCancelacion) {
      Swal.fire({
        title: '¿Expedir la resolución?',
        icon: 'question',
        text: '¿Está seguro que desea expedir la resolución?',
        html: '<p><b> Número: </b>' + this.resolucion.NumeroResolucion.toString() + '</p>' +
          '<p><b> Facultad: </b>' + this.resolucion.Facultad + '</p>' +
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
        idResolucion: this.resolucion.Id,
        FechaExpedicion: this.FechaExpedicion
      };
      //this.resolucion.FechaExpedicion = this.FechaExpedicion;
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
    this.dialogRef.close(false);
  }

}

import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-expedir-modificacion',
  templateUrl: './expedir-modificacion.component.html',
  styleUrls: ['./expedir-modificacion.component.scss']
})
export class ExpedirModificacionComponent implements OnInit {

  @Input() idResolucionM: number;
  @Input() resolucion;

  @Output() cancelarModificacion = new EventEmitter<string>();

  vigencia: any;
  fechaExpedicion: any;
  
  resolucionActual: any;
  contenidoResolucion: any;
  contratadosPdf: any;
  numeroResolucionModificada: any;
  datosFiltro: any;
  sede_solicitante_defecto: any;
  contratados: any;
  proyectos: any;
  ordenadorGasto: any;
  punto_salarial: any;
  salario_minimo: any;
  vigencia_data: any;
  forma_pago_defecto;
  regimen_contratacion_defecto;

  contratoGeneralBase: any;
  acta: any;
  estado = false;
  CurrentDate = new Date();
  esconderBoton = false;
  FechaExpedicion = null;
  resolucionTest = JSON.parse(localStorage.getItem("resolucion"));

  constructor(
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.asignarValoresDefecto();
  }

  cargarDatos() {

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/` + this.idResolucionM
    ).subscribe((response: Respuesta) => {
      this.resolucionActual = response.Data;
      if (this.resolucionActual.FechaExpedicion !== undefined && this.resolucionActual.FechaExpedicion !== "0001-01-01T00:00:00Z") {
        this.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      }
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        'tipo_resolucion/' + this.resolucionActual.TipoResolucionId.Id
      ).subscribe((response2: Respuesta) => {
        this.resolucionActual.TipoResolucionId.NombreTipoResolucion = response2.Data.NombreTipoResolucion;
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          "gestion_documento_resolucion/get_contenido_resolucion?id_resolucion=" + this.resolucionActual.Id + "&id_facultad=" + this.resolucionActual.DependenciaFirmaId
        ).subscribe((response3: Respuesta) => {
          this.contenidoResolucion = response3.Data;
          this.request.get(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            "gestion_previnculacion/docentes_previnculados_all?id_resolucion=" + this.resolucionActual.Id
          ).subscribe((response4: Respuesta) => {
            this.contratadosPdf = response4.Data;
          });
        });
      });
    });

    this.request.get(
      environment.OIKOS_SERVICE,
      'dependencia/' + this.resolucion.Facultad
    ).subscribe((response: Respuesta) => {
      this.resolucion.FacultadNombre = response.Data.Nombre;
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      "modificacion_resolucion/?query=ResolucionNuevaId.Id:" + this.idResolucionM
    ).subscribe((response: Respuesta) => {
      var resolucionModificada = response.Data[0].ResolucionAnteriorId.Id;
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        "resolucion/" + resolucionModificada
      ).subscribe((response2: Respuesta) => {
        this.numeroResolucionModificada = response2.Data.NumeroResolucion;
      });
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      "resolucion_vinculacion_docente/" + this.idResolucionM
    ).subscribe((response: Respuesta) => {
      this.datosFiltro = response.Data;
      this.request.get(
        environment.OIKOS_SERVICE,
        "dependencia/" + this.datosFiltro.FacultadId.toString()
      ).subscribe((response2: Respuesta) => {
        this.contratoGeneralBase.Contrato.SedeSolicitante = response2.Data.Id.toString();
        this.sede_solicitante_defecto = response2.Data.Nombre;
      });
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        "gestion_previnculacion/docentes_previnculados?id_resolucion=" + this.idResolucionM.toString()
      ).subscribe((response2: Respuesta) => {
        this.contratados = response2.Data;
      });
      this.request.get(
        environment.OIKOS_SERVICE,
        "dependencia/proyectosPorFacultad/" + this.resolucion.Facultad + "/" + this.datosFiltro.NivelAcademico
      ).subscribe((response2: Respuesta) => {
        this.proyectos = response2.Data;
      });
      this.request.get(
        environment.CORE_AMAZON_SERVICE,
        "ordenador_gasto?query=DependenciaId%3A" + this.datosFiltro.FacultadId.toString()
      ).subscribe((response2: Respuesta) => {
        if (response2.Data === null) {
          this.request.get(
            environment.CORE_AMAZON_SERVICE,
            "ordenador_gasto/1"
          ).subscribe((response3: Respuesta) => {
            this.ordenadorGasto = response3.Data;
          });
        } else {
          this.ordenadorGasto = response2.Data[0];
        }
      });
    });

    this.request.get(
      environment.CORE_AMAZON_SERVICE,
      "punto_salarial?sortby=Vigencia&order=desc&limit=1"
    ).subscribe((response: Respuesta) => {
      this.punto_salarial = response.Data[0];
    });
    this.request.get(
      environment.CORE_AMAZON_SERVICE,
      "salario_minimo?sortby=Vigencia&order=desc&limit=1"
    ).subscribe((response: Respuesta) => {
      this.salario_minimo = response.Data[0];
    });
    this.request.get(
      environment.ADMIN_AMAZON_SERVICE,
      'vigencia_contrato?limit=-1'
    ).subscribe((response: Respuesta) => {
      this.vigencia_data = response.Data;
    });

    this.request.get(
      environment.ADMIN_AMAZON_SERVICE,
      "parametros/240"
    ).subscribe((response: Respuesta) => {
      this.forma_pago_defecto = response.Data;
    });
    this.request.get(
      environment.ADMIN_AMAZON_SERVICE,
      "parametros/136"
    ).subscribe((response: Respuesta) => {
      this.regimen_contratacion_defecto = response.Data;
    });

    this.request.get(
      environment.OIKOS_SERVICE,
      ``
    ).subscribe((response: Respuesta) => {

    });

  }

  asignarValoresDefecto() {
    this.contratoGeneralBase.Contrato.Vigencia = new Date().getFullYear();
    this.contratoGeneralBase.Contrato.FormaPago = { Id: 240 };
    this.contratoGeneralBase.Contrato.DescripcionFormaPago = "Abono a Cuenta Mensual de acuerdo a puntas y hotras laboradas";
    this.contratoGeneralBase.Contrato.Justificacion = "Docente de Vinculacion Especial";
    this.contratoGeneralBase.Contrato.UnidadEjecucion = { Id: 269 };
    this.contratoGeneralBase.Contrato.LugarEjecucion = { Id: 4 };
    this.contratoGeneralBase.Contrato.Observaciones = "Contrato de Docente Vinculación Especial";
    this.contratoGeneralBase.Contrato.TipoControl = 181;
    this.contratoGeneralBase.Contrato.ClaseContratista = 33;
    this.contratoGeneralBase.Contrato.TipoMoneda = 137;
    this.contratoGeneralBase.Contrato.OrigenRecursos = 149;
    this.contratoGeneralBase.Contrato.OrigenPresupuesto = 156;
    this.contratoGeneralBase.Contrato.TemaGastoInversion = 166;
    this.contratoGeneralBase.Contrato.TipoGasto = 146;
    this.contratoGeneralBase.Contrato.RegimenContratacion = 136;
    this.contratoGeneralBase.Contrato.Procedimiento = 132;
    this.contratoGeneralBase.Contrato.ModalidadSeleccion = 123;
    this.contratoGeneralBase.Contrato.TipoCompromiso = 35;
    this.contratoGeneralBase.Contrato.TipologiaContrato = 46;
    this.contratoGeneralBase.Contrato.FechaRegistro = new Date();
    this.contratoGeneralBase.Contrato.UnidadEjecutora = 1;
    this.contratoGeneralBase.Contrato.Condiciones = "Sin condiciones";
    this.acta.Descripcion = "Acta inicio resolución Docente Vinculación Especial";
  }

  realizarContrato() {
    if (this.datosFiltro.Dedicacion === "HCH") {
      this.contratoGeneralBase.Contrato.TipoContrato = { Id: 3 };
      this.contratoGeneralBase.Contrato.ObjetoContrato = "Docente de Vinculación Especial - Honorarios";
    } else if (this.datosFiltro.Dedicacion === "HCP") {
      this.contratoGeneralBase.Contrato.TipoContrato = { Id: 2 };
      this.contratoGeneralBase.Contrato.ObjetoContrato = "Docente de Vinculación Especial - Salario";
    } else {
      this.contratoGeneralBase.Contrato.TipoContrato = { Id: 18 };
      this.contratoGeneralBase.Contrato.ObjetoContrato = "Docente de Vinculación Especial - Medio Tiempo Ocasional (MTO) - Tiempo Completo Ocasional (TCO)";
    }
    if (this.FechaExpedicion) {
      Swal.fire({
        title: "Expedir",
        text: "¿Está seguro que desea expedir la resolución?",
        html: '<p><b> Número: </b>' + this.resolucion.Numero.toString() + '</p>' +
          '<p><b> Facultad: </b>' + this.resolucion.FacultadNombre + '</p>' +
          '<p><b> Nivel académico: </b>' + this.resolucion.NivelAcademico + '</p>' +
          '<p><b> Dedicación: </b>' + this.resolucion.Dedicacion + '</p>',
        icon: 'warning',
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
        this.guardarContratos();
      }, function (dismiss) {
        if (dismiss === 'cancel') {
          Swal.fire({
            text: 'No se ha realizado la expedición de la resolución',
            icon: 'error',
            allowOutsideClick: false
          });
        }
      });
    } else {
      Swal.fire({
        text: 'Complete todos Los campos',
        icon: 'warning'
      });
    }
  }

  guardarContratos() {
    this.estado = true;
    this.esconderBoton = true;
    var conjuntoContratos = [];
    if (this.contratados) {
      this.contratados.forEach(function (contratado) {
        var contratoGeneral = JSON.parse(JSON.stringify(this.contratoGeneralBase.Contrato));
        var actaI = JSON.parse(JSON.stringify(this.acta));
        actaI.FechaInicio = contratado.FechaInicio;
        contratoGeneral.Contratista = parseInt(contratado.PersonaId);
        contratoGeneral.DependenciaSolicitante = contratado.ProyectoCurricularId.toString();
        contratoGeneral.PlazoEjecucion = parseInt(contratado.NumeroHorasSemanales);
        contratoGeneral.OrdenadorGasto = this.ordenadorGasto.Id;
        contratoGeneral.ValorContrato = parseInt(contratado.ValorContrato);
        var contratoVinculacion = {
          ContratoGeneral: contratoGeneral,
          ActaInicio: actaI,
          VinculacionDocente: {
            Id: parseInt(contratado.Id),
            NumeroSemanasNuevas: contratado.NumeroSemanasNuevas,
            NumeroHorasNuevas: contratado.NumeroHorasNuevas,
            NivelAcademico: this.resolucionTest.NivelAcademico,
            Dedicacion: this.resolucionTest.Dedicacion
          }
        };
        if (this.datosFiltro.NivelAcademico.toLowerCase() === "pregrado") {
          //contratoVinculacion.VinculacionDocente.IdPuntoSalarial = this.punto_salarial.Id;
        } else if (this.datosFiltro.NivelAcademico.toLowerCase() === "posgrado") {
          //contratoVinculacion.VinculacionDocente.IdSalarioMinimo = this.salario_minimo.Id;
        }
        conjuntoContratos.push(contratoVinculacion);
      });
      var expedicionResolucion = {
        Vinculaciones: conjuntoContratos,
        idResolucion: this.idResolucionM,
        FechaExpedicion: this.FechaExpedicion
      };
      this.resolucion.FechaExpedicion = this.FechaExpedicion;
      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        "expedir_resolucion/validar_datos_expedicion",
        expedicionResolucion
      ).subscribe((response: Respuesta) => {
        if (response.Data === 'OK') {
          this.request.post(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            "expedir_resolucion/expedirModificacion",
            expedicionResolucion
          ).subscribe((response2: Respuesta) => {
            this.estado = false;
            if (response2.Data.Status !== '201') {
              Swal.fire({
                text: response.Data,
                title: "Alerta",
                icon: "error",
                confirmButtonText: 'Aceptar',
                showLoaderOnConfirm: true,
                allowOutsideClick: false
              });
            } else {
              this.guardarResolucionNuxeo();
            }
          });
        } else {
          Swal.fire({
            text: response.Data,
            title: "Alerta",
            icon: "error",
            confirmButtonText: 'Aceptar',
            showLoaderOnConfirm: true,
            allowOutsideClick: false
          });
        }
      });
    } else {
      Swal.fire({
        text: 'No hay docentes inscritos dentro de la resolución',
        title: "Alerta",
        icon: "warning",
        confirmButtonText: 'Aceptar',
        showLoaderOnConfirm: true,
        allowOutsideClick: false
      });
    }
  }

  guardarResolucionNuxeo() {

  }

  cancelarExpedicion() {
    this.cancelarModificacion.emit('')
  }

}

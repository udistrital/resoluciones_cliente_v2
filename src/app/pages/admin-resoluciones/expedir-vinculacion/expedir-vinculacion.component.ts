import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-expedir-vinculacion',
  templateUrl: './expedir-vinculacion.component.html',
  styleUrls: ['./expedir-vinculacion.component.scss']
})
export class ExpedirVinculacionComponent implements OnInit {

  @Input() idResolucionV: number;
  resolucion: Resoluciones;

  resolucionActual: Resolucion;
  contenidoResolucion: Respuesta;
  contratadosPdf = [];
  datosFiltro: any;
  sede_solicitante_defecto: any;
  contratados: any;
  proyectos: any;
  ordenadorGasto: any;
  punto_salarial: any;
  salario_minimo: any;
  vigencia_data: any;
  forma_pago_defecto: any;
  regimen_contratacion_defecto: any;

  contratoGeneralBase;
  acta;
  estado = false;
  currentDate = new Date();
  esconderBoton = false;
  FechaExpedicion = null;
  docentes_desagregados = [];

  validarFecha: null;
  vigencia: number;
  formaPago: string;
  sedeSol: string;
  fechaInicio = new Date();
  justificacion: string;
  observaciones: string;
  descripcion: string;
  numRes: string;
  tipoRes: string;
  numSemanas: number;
  fechaExpedicion = new Date();

  constructor(
    private request: RequestManager,
    public dialogRef: MatDialogRef<ExpedirVinculacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Resoluciones,
  ) {
    this.resolucion = this.data;
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close(false));
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log(this.resolucion);

    this.vigencia = this.resolucion.Vigencia;
    this.numRes =  this.resolucion.NumeroResolucion;
    this.tipoRes =  this.resolucion.TipoResolucion;

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/${this.resolucion.Id}`
    ).subscribe((responseRes: Respuesta) => {
      this.resolucionActual = responseRes.Data as Resolucion;
      if (this.resolucionActual.FechaExpedicion !== undefined && this.resolucionActual.FechaExpedicion !== new Date('0001-01-01T00:00:00Z')) {
        this.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      }
    });
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_previnculacion/docentes_previnculados_all?id_resolucion=` + this.resolucionActual.Id
    ).subscribe((response4: Respuesta) => {
      this.contratadosPdf = response4.Data;
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion_vinculacion_docente/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.datosFiltro = response.Data;
      this.request.get(
        environment.OIKOS_SERVICE,
        `dependencia/` + this.datosFiltro.FacultadId
      ).subscribe((response2: Respuesta) => {
        this.contratoGeneralBase.Contrato.SedeSolicitante = response2.Data.Id.toString();
        this.sede_solicitante_defecto = response2.Data.Nombre;
      });
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_previnculacion/docentes_previnculados?id_resolucion=` + this.idResolucionV.toString()
      ).subscribe((response3: Respuesta) => {
        this.contratados = response3.Data;
      });
      this.request.get(
        environment.OIKOS_SERVICE,
        `dependencia/proyectosPorFacultad/` + this.resolucion.Facultad + `/` + this.datosFiltro.NivelAcademico
      ).subscribe((response4: Respuesta) => {
        this.proyectos = response4.Data;
      });
      this.request.get(
        environment.CORE_AMAZON_SERVICE,
        `ordenador_gasto?query=DependenciaId:` + this.datosFiltro.FacultadId
      ).subscribe((response5: Respuesta) => {
        if (response5.Data === null) {
          this.request.get(
            environment.CORE_AMAZON_SERVICE,
            `ordenador_gasto/1`
          ).subscribe((response6: Respuesta) => {
            this.ordenadorGasto = response6.Data;
          });
        } else {
          this.ordenadorGasto = response5.Data[0];
        }
      });
    });

    this.request.get(
      environment.CORE_AMAZON_SERVICE,
      `punto_salarial?sortby=Vigencia&order=desc&limit=1`
    ).subscribe((response: Respuesta) => {
      this.punto_salarial = response.Data[0];
    });

    this.request.get(
      environment.CORE_AMAZON_SERVICE,
      `salario_minimo?sortby=Vigencia&order=desc&limit=1`
    ).subscribe((response: Respuesta) => {
      this.salario_minimo = response.Data[0];
    });

    this.request.get(environment.ADMIN_AMAZON_SERVICE, `vigencia_contrato?limit=-1`).subscribe((response: Respuesta) => {
      console.log('dato de limite = -1 xd', response.Data);
      this.vigencia_data = response.Data;
    });

    this.asignarValoresDefecto();

    this, this.request.get(
      environment.ADMIN_AMAZON_SERVICE,
      `parametros/240`
    ).subscribe((response: Respuesta) => {
      this.forma_pago_defecto = response.Data;
    });

    this, this.request.get(
      environment.ADMIN_AMAZON_SERVICE,
      `parametros/136`
    ).subscribe((response: Respuesta) => {
      this.regimen_contratacion_defecto = response.Data;
    });

  }

  asignarValoresDefecto() {

    this.contratoGeneralBase.Contrato.Vigencia = new Date().getFullYear();
    this.contratoGeneralBase.Contrato.FormaPago = { Id: 240 };
    this.contratoGeneralBase.Contrato.DescripcionFormaPago = 'Abono a Cuenta Mensual de acuerdo a puntas y hotras laboradas';
    this.contratoGeneralBase.Contrato.Justificacion = 'Docente de Vinculacion Especial';
    this.contratoGeneralBase.Contrato.UnidadEjecucion = { Id: 269 };
    this.contratoGeneralBase.Contrato.LugarEjecucion = { Id: 4 };
    this.contratoGeneralBase.Contrato.Observaciones = 'Contrato de Docente Vinculación Especial';
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
    this.contratoGeneralBase.Contrato.Condiciones = 'Sin condiciones';
    this.acta.Descripcion = 'Acta inicio resolución Docente Vinculación Especial';
  }

  realizarContrato() {

    if (this.datosFiltro.Dedicacion === 'HCH') {
      this.contratoGeneralBase.Contrato.TipoContrato = { Id: 3 };
      this.contratoGeneralBase.Contrato.ObjetoContrato = 'Docente de Vinculación Especial - Honorarios';
    } else if (this.datosFiltro.Dedicacion === 'HCP') {
      this.contratoGeneralBase.Contrato.TipoContrato = { Id: 2 };
      this.contratoGeneralBase.Contrato.ObjetoContrato = 'Docente de Vinculación Especial - Salario';
    } else {
      this.contratoGeneralBase.Contrato.TipoContrato = { Id: 18 };
      this.contratoGeneralBase.Contrato.ObjetoContrato = 'Docente de Vinculación Especial - Medio Tiempo Ocasional (MTO) - Tiempo Completo Ocasional (TCO)';
    }
    if (this.FechaExpedicion && this.acta.FechaInicio) {
      Swal.fire({
        title: '¿Expedir la resolución?',
        icon: 'warning',
        iconColor: 'btn btn-danger',
        text: '¿Está seguro de que desea expedir la resolución?',
        html: '<p><b>Número: </b>' + this.resolucion.NumeroResolucion.toString() + '</p>' +
          '<p><b>Facultad: </b>' + this.resolucion.Facultad + '</p>' +
          '<p><b>Nivel académico: </b>' + this.resolucion.NivelAcademico + '</p>' +
          '<p><b>Dedicación: </b>' + this.resolucion.Dedicacion + '</p>',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonAriaLabel: 'btn btn-success',
        cancelButtonAriaLabel: 'btn btn-danger',
        buttonsStyling: false,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.guardarContratos();
        } else {
          Swal.fire({
            title: 'ola',
            text: 'Se está cancelando ey',
            allowOutsideClick: false
          })
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        iconColor: 'btn btn-danger',
        text: 'Complete los campos',
      });
    }

  }

  guardarContratos() {

    this.estado = true;
    this.esconderBoton = true;
    var conjuntoContratos = [];
    if (this.contratados) {
      this.contratados.forEach(contratado => {
        var contratoGeneral = JSON.parse(JSON.stringify(this.contratoGeneralBase.contrato));
        var actaI = JSON.parse(JSON.stringify(this.acta));
        contratoGeneral.Contratista = parseInt(contratado.PersonaId);
        contratoGeneral.DependenciaSolicitante = contratado.ProyectoCurricularId.toString();
        contratoGeneral.PlazoEjecucion = parseInt(contratado.NumeroHorasSemanales);
        contratoGeneral.OrdenadorGasto = this.ordenadorGasto.Id;
        contratoGeneral.ValorContrato = parseInt(contratado.ValorContrato);
        var contratoVinculacion = {
          ContratoGeneral: contratoGeneral,
          ActaInicio: actaI,
          VinculacionDocente: { Id: parseInt(contratado.Id), PuntoSalarialId: null, SalarioMinimoId: null }
        };
        if (this.datosFiltro.NivelAcademico.toLowerCase() === 'pregrado') {
          contratoVinculacion.VinculacionDocente.PuntoSalarialId = this.punto_salarial.Id;
        } else if (this.datosFiltro.NivelAcademico.toLowerCase() === 'posgrado') {
          contratoVinculacion.VinculacionDocente.SalarioMinimoId = this.salario_minimo.Id;
        }
        conjuntoContratos.push(contratoVinculacion);
      });
      var expedicionResolucion = {
        Vinculaciones: conjuntoContratos,
        idResolucion: this.resolucion.Id,
        FechaExpedicion: this.FechaExpedicion
      };
      //this.resolucion.FechaExpedicion = this.FechaExpedicion;

      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `expedir_resolucion/validar_datos_expedicion`,
        expedicionResolucion
      ).subscribe((response: Respuesta) => {
        if (response.Data === 'OK') {
          this.request.post(
            environment.RESOLUCIONES_MID_V2_SERVICE,
            `expedir_resolucion/expedir`,
            expedicionResolucion
          ).subscribe((response2: Respuesta) => {
            this.estado = false;
            if (response2.Data.Status !== '201') {
              Swal.fire({
                text: response.Data,
                title: 'Alerta',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                showLoaderOnConfirm: true,
                allowOutsideClick: false
              });
            } else {
              //this.guardarResolucionNuxeo();
            }
          });
        } else {
          Swal.fire({
            text: response.Data,
            title: 'Alerta',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            showLoaderOnConfirm: true,
            allowOutsideClick: false
          });
        }
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

  cancelarExpedicion() {
    this.dialogRef.close(false);
  }

}

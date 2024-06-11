import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import { ActaInicio } from 'src/app/@core/models/acta_inicio';
import { ContratoGeneral } from 'src/app/@core/models/contrato_general';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { UtilService } from '../../services/utilService';
import { RequestManager } from '../../services/requestManager';
import * as moment from 'moment';

@Component({
  selector: 'app-expedir-vinculacion',
  templateUrl: './expedir-vinculacion.component.html',
  styleUrls: ['./expedir-vinculacion.component.scss']
})
export class ExpedirVinculacionComponent implements OnInit {

  resolucionActual: Resolucion;
  resolucion: Resoluciones;
  Contrato: ContratoGeneral;
  resolucionVinculacion: ResolucionVinculacionDocente;
  contratados: Vinculaciones[];
  acta: ActaInicio;
  fechaFin: Date;
  resolucionAux: Resolucion;
  esconderBoton = false;

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    public dialogRef: MatDialogRef<ExpedirVinculacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Resoluciones,
  ) {
    this.resolucion = this.data;
    this.resolucionActual = new Resolucion();
    this.Contrato = new ContratoGeneral();
    this.acta = new ActaInicio();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close(false));
  }

  ngOnInit(): void {
    this.asignarValoresDefecto();
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/${this.resolucion.Id}`
    ).subscribe((responseRes: Respuesta) => {
      this.resolucionActual = responseRes.Data as Resolucion;
      this.resolucionAux = responseRes.Data as Resolucion;
      this.acta.FechaInicio = (this.resolucionActual.FechaInicio).toString()
      this.cambioFechaResolucion();
      if (this.resolucionActual.FechaExpedicion !== undefined
          && String(this.resolucionActual.FechaExpedicion) !== '0001-01-01T00:00:00Z') {
        this.resolucionActual.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      } else {
        this.resolucionActual.FechaExpedicion = null;
      }
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion_vinculacion_docente/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.resolucionVinculacion = response.Data as ResolucionVinculacionDocente;
      this.Contrato.SedeSolicitante = this.resolucion.Facultad;
    });

    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/${this.resolucion.Id}`
    ).subscribe((response3: Respuesta) => {
      this.contratados = response3.Data as Vinculaciones[];
    });

  }

  asignarValoresDefecto(): void {
    this.Contrato.VigenciaContrato = new Date().getFullYear();
    this.Contrato.FormaPago = { Id: 240 };
    this.Contrato.DescripcionFormaPago = 'Abono a Cuenta Mensual de acuerdo a puntos y horas laboradas';
    this.Contrato.Justificacion = 'Docente de Vinculación Especial';
    this.Contrato.UnidadEjecucion = { Id: 269 };
    this.Contrato.LugarEjecucion = { Id: 4 };
    this.Contrato.Observaciones = 'Contrato de Docente Vinculación Especial';
    this.Contrato.TipoControl = 181;
    this.Contrato.ClaseContratista = 33;
    this.Contrato.TipoMoneda = 137;
    this.Contrato.OrigenRecursos = 149;
    this.Contrato.OrigenPresupuesto = 156;
    this.Contrato.TemaGastoInversion = 166;
    this.Contrato.TipoGasto = 146;
    this.Contrato.RegimenContratacion = 136;
    this.Contrato.Procedimiento = 132;
    this.Contrato.ModalidadSeleccion = 123;
    this.Contrato.TipoCompromiso = 35;
    this.Contrato.TipologiaContrato = 46;
    this.Contrato.FechaRegistro = new Date();
    this.Contrato.UnidadEjecutora = 1;
    this.Contrato.Condiciones = 'Sin condiciones';
    this.acta.Descripcion = 'Acta inicio resolución Docente Vinculación Especial';
  }

  realizarContrato(): void {
    let regexAnio = /\b\d{4}\b/
    let anioInicio = parseInt(this.acta.FechaInicio.toString().match(regexAnio)[0])
    let anioExpedicion = parseInt(this.resolucionActual.FechaExpedicion.toString().match(regexAnio)[0])
    if (this.resolucionVinculacion.Dedicacion === 'HCH') {
      this.Contrato.TipoContrato = { Id: 3 };
      this.Contrato.ObjetoContrato = 'Docente de Vinculación Especial - Honorarios';
    } else if (this.resolucionVinculacion.Dedicacion === 'HCP') {
      this.Contrato.TipoContrato = { Id: 2 };
      this.Contrato.ObjetoContrato = 'Docente de Vinculación Especial - Salario';
    } else {
      this.Contrato.TipoContrato = { Id: 18 };
      this.Contrato.ObjetoContrato = 'Docente de Vinculación Especial - Medio Tiempo Ocasional (MTO) - Tiempo Completo Ocasional (TCO)';
    }

    if (this.resolucionActual.FechaExpedicion && this.acta.FechaInicio) {
      anioInicio != this.resolucion.Vigencia ?
        this.popUp.error("Periodo de vincualción no coincide con vigencia") :
        anioExpedicion != this.resolucion.Vigencia ?
          this.popUp.warning("Fecha de expedición no coincide con vigencia") :
          this.expedir()

    } else {
      this.popUp.warning('Complete los campos');
    }
  }

  expedir(): void {
    this.popUp.confirmarExpedicion(
      '¿Expedir la resolución?',
      '¿Está seguro de que desea expedir la resolución?',
      this.resolucion,
    ).then(result => {
      if (result.isConfirmed) {
        this.guardarContratos();
      }
    });
  }

  guardarContratos(): void {
    this.esconderBoton = true;
    const conjuntoContratos = [];
    if (this.contratados.length > 0) {
      this.contratados.forEach(contratado => {
        const contratoGeneral: ContratoGeneral = {...this.Contrato};
        const actaI: ActaInicio = {...this.acta};
        actaI.FechaInicio = moment(actaI.FechaInicio).format('YYYY-MM-DDT00:00:00Z');
        contratoGeneral.Contratista = contratado.PersonaId;
        contratoGeneral.DependenciaSolicitante = contratado.ProyectoCurricularId.toString();
        contratoGeneral.PlazoEjecucion = contratado.NumeroHorasSemanales;

        const contratoVinculacion = {
          ContratoGeneral: contratoGeneral,
          ActaInicio: actaI,
          VinculacionDocente: { Id: contratado.Id }
        };

        conjuntoContratos.push(contratoVinculacion);
      });
      const expedicionResolucion = {
        Vinculaciones: conjuntoContratos,
        idResolucion: this.resolucion.Id,
        FechaExpedicion: this.resolucionActual.FechaExpedicion,
        Usuario: localStorage.getItem('user'),
      };
      this.popUp.loading();
      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `expedir_resolucion/validar_datos_expedicion`,
        expedicionResolucion
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Data === 'OK') {
            this.request.post(
              environment.RESOLUCIONES_MID_V2_SERVICE,
              `expedir_resolucion/expedir`,
              expedicionResolucion
            ).subscribe({
              next: (response2: Respuesta) => {
                if (response2.Success) {
                  this.esconderBoton = false;
                  this.popUp.close();
                  this.popUp.success('La resolución ha sido expedida con éxito.').then(result => {
                    if (result.isConfirmed) {
                      this.dialogRef.close(true);
                    }
                  });
                }
              }, error: () => {
                this.popUp.close();
                this.popUp.error('No se ha podido expedir la resolución.');
              }
            });
          } else {
            this.popUp.close();
            this.popUp.warning('Datos invalidos. Por favor revise la información de la resolución y las vinculaciones.');
          }
        }, error: () => {
          this.popUp.close();
          this.popUp.warning('Datos invalidos. Por favor revise la información de la resolución y las vinculaciones.');
        }
      });
    } else {
      this.popUp.warning('No hay docentes inscritos dentro de la resolución');
    }
  }

  cancelarExpedicion(): void {
    this.dialogRef.close(false);
  }

  cambioFechaResolucion() {
    var object = {
      "FechaInicio": this.acta.FechaInicio,
      "NumeroSemanas": this.resolucionActual.NumeroSemanas
    }
    this.request.post(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_plantillas/calculo_fecha_fin`,
      object
    ).subscribe(response => {
      this.resolucionActual.FechaFin = response.Data
      this.resolucionAux.FechaInicio = new Date(this.acta.FechaInicio)
      this.resolucionAux.FechaFin = this.resolucionActual.FechaFin
      this.request.put(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion`,
        this.resolucionAux,
        this.resolucionAux.Id
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            this.popUp.close();
          }
        }, error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido actualizar la resolución');
        }
      });
    })
  }


}

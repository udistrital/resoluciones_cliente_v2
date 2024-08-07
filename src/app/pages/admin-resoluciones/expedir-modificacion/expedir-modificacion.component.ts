import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import { ActaInicio } from 'src/app/@core/models/acta_inicio';
import { ContratoGeneral } from 'src/app/@core/models/contrato_general';
import { ModificacionResolucion } from 'src/app/@core/models/modificacion_resolucion';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { UtilService } from '../../services/utilService';
import { RequestManager } from '../../services/requestManager';
import * as moment from 'moment';

@Component({
  selector: 'app-expedir-modificacion',
  templateUrl: './expedir-modificacion.component.html',
  styleUrls: ['./expedir-modificacion.component.scss']
})
export class ExpedirModificacionComponent implements OnInit {

  resolucionActual: Resolucion;
  resolucion: Resoluciones;
  Contrato: ContratoGeneral;
  resolucionVinculacion: ResolucionVinculacionDocente;
  contratados: Vinculaciones[];
  acta: ActaInicio;
  modificacionResolucion: ModificacionResolucion;
  esconderBoton = false;

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    public dialogRef: MatDialogRef<ExpedirModificacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Resoluciones,
  ) {
    this.resolucion = this.data;
    this.modificacionResolucion = new ModificacionResolucion();
    this.modificacionResolucion.ResolucionAnteriorId = new Resolucion();
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
    ).subscribe((response: Respuesta) => {
      this.resolucionActual = response.Data as Resolucion;
      if (this.resolucionActual.FechaExpedicion !== undefined
          && String(this.resolucionActual.FechaExpedicion) !== '0001-01-01T00:00:00Z') {
        this.resolucionActual.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      } else {
        this.resolucionActual.FechaExpedicion = null;
      }
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `modificacion_resolucion/?query=ResolucionNuevaId.Id:${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.modificacionResolucion = (response.Data as ModificacionResolucion[])[0];
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
    if (this.resolucionActual.FechaExpedicion) {
      const fechaExpedicion = new Date(this.resolucionActual.FechaExpedicion)
      const anioExpedicion = fechaExpedicion.getFullYear()
      anioExpedicion != this.resolucionActual.Vigencia ?
        this.popUp.warning("Fecha de expedición no coincide con vigencia") :
        this.confirmarExpedir()
    } else {
      this.popUp.warning('Complete los campos');
    }
  }

  confirmarExpedir() {
    this.popUp.confirmarExpedicion(
      '¿Expedir la resolución?',
      '¿Está seguro que desea expedir la resolución?',
      this.resolucion,
    ).then((result) => {
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
        const contratoGeneral = {...this.Contrato};
        const actaI = {...this.acta};
        actaI.FechaInicio = moment(actaI.FechaInicio).format('YYYY-MM-DDT00:00:00Z');
        contratoGeneral.Contratista = contratado.PersonaId;
        contratoGeneral.DependenciaSolicitante = contratado.ProyectoCurricularId.toString();
        contratoGeneral.PlazoEjecucion = contratado.NumeroHorasSemanales;
        const contratoVinculacion = {
          ContratoGeneral: contratoGeneral,
          ActaInicio: actaI,
          VinculacionDocente: {
            Id: contratado.Id,
            NumeroSemanasNuevas: contratado.NumeroSemanas,
            NumeroHorasNuevas: contratado.NumeroHorasSemanales,
            NivelAcademico: this.resolucion.NivelAcademico,
            Dedicacion: this.resolucion.Dedicacion
          }
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
        'expedir_resolucion/validar_datos_expedicion',
        expedicionResolucion
      ).subscribe({
        next: (response: Respuesta) => {
          if (response.Data === 'OK') {
            this.request.post(
              environment.RESOLUCIONES_MID_V2_SERVICE,
              'expedir_resolucion/expedirModificacion',
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

}

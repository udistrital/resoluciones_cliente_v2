import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RequestManager } from '../../services/requestManager';
import { Resoluciones } from 'src/app/@core/models/resoluciones';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaPrevinculacion } from 'src/app/@core/models/tabla_previnculacion';
import { environment } from 'src/environments/environment';
import { LocalDataSource } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { ContratoCancelado } from 'src/app/@core/models/contrato_cancelado';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-expedir-cancelacion',
  templateUrl: './expedir-cancelacion.component.html',
  styleUrls: ['./expedir-cancelacion.component.scss']
})
export class ExpedirCancelacionComponent implements OnInit {

  resolucion: Resoluciones;
  resolucionActual: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  contratados: Vinculaciones[];
  adminCancelacionData: LocalDataSource;
  adminCancelacionsettings: any;
  contratoCanceladoBase: ContratoCancelado;
  esconderBoton = false;

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    public dialogRef: MatDialogRef<ExpedirCancelacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Resoluciones,
  ) {
    this.resolucion = this.data;
    this.resolucionActual = new Resolucion();
    this.contratoCanceladoBase = new ContratoCancelado();
    this.initTable();
  }

  ngOnInit(): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.contratados = response.Data as Vinculaciones[];
      this.adminCancelacionData = new LocalDataSource(response.Data);
    });

    this.cargarDatos();
  }

  initTable(): void {
    this.adminCancelacionsettings = {
      columns: TablaPrevinculacion,
      mode: 'external',
      actions: false,
      selectedRowIndex: -1,
      noDataMessage: 'No hay cancelaciones registradas en el sistema',
    };
  }

  cargarDatos(): void {
    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.resolucionActual = response.Data as Resolucion;
      if (this.resolucionActual.FechaExpedicion !== undefined
          && this.resolucionActual.FechaExpedicion !== new Date('0001-01-01T00:00:00Z')) {
        this.resolucionActual.FechaExpedicion = new Date(this.resolucionActual.FechaExpedicion);
      }
    });

    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion_vinculacion_docente/${this.resolucion.Id}`
    ).subscribe((response: Respuesta) => {
      this.resolucionVinculacion = response.Data as ResolucionVinculacionDocente;
    });
  }

  asignarValoresDefecto(): void {
    this.contratoCanceladoBase.Usuario = localStorage.getItem('user');
    this.contratoCanceladoBase.Estado = true;
  }

  cancelarContrato(): void {
    this.asignarValoresDefecto();
    if (this.resolucionActual.FechaExpedicion && this.contratoCanceladoBase.MotivoCancelacion) {
      this.popUp.confirmarExpedicion(
        '¿Expedir la resolución?',
        '¿Está seguro que desea expedir la resolución?',
        this.resolucion,
        this.contratados.length
      ).then((result) => {
        if (result.isConfirmed) {
          this.expedirCancelar();
        }
      });
    } else {
      this.popUp.warning('Complete todos Los campos');
    }
  }

  expedirCancelar(): void {
    this.esconderBoton = true;
    const conjuntoContratos = [];
    if (this.contratados) {
      this.contratados.forEach(contratado => {
        const contratoCancelado: ContratoCancelado = JSON.parse(JSON.stringify(this.contratoCanceladoBase));
        contratoCancelado.NumeroContrato = contratado.NumeroContrato;
        contratoCancelado.Vigencia = contratado.Vigencia;
        const CancelacionContrato = {
          ContratoCancelado: contratoCancelado,
          VinculacionDocente: {
            Id: contratado.Id,
            NumeroSemanasNuevas: contratado.NumeroSemanas
          }
        };
        conjuntoContratos.push(CancelacionContrato);
      });
      const expedicionResolucion = {
        Vinculaciones: conjuntoContratos,
        idResolucion: this.resolucion.Id,
        FechaExpedicion: this.resolucionActual.FechaExpedicion
      };
      this.request.post(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `expedir_resolucion/cancelar`,
        expedicionResolucion
      ).subscribe((response: Respuesta) => {
        if (response.Success) {
          this.esconderBoton = false;
          this.popUp.success('La resolución ha sido expedida con éxito.').then(result => {
            if (result.isConfirmed) {
              this.dialogRef.close(true);
            }
          });
        }
      });
    } else {
      this.popUp.error('No hay docentes inscritos dentro de la resolución');
    }
  }

  cancelarExpedicion(): void {
    this.dialogRef.close(false);
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';
import { Respuesta } from 'src/app/@core/models/respuesta';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-reducciones',
  templateUrl: './modal-reducciones.component.html',
  styleUrls: ['./modal-reducciones.component.scss']
})
export class ModalReduccionesComponent implements OnInit {

  cambioVinculacion: CambioVinculacion;
  registrosPresupuestales: DocumentoPresupuestal[];

  horasTotales: number;

  constructor(
    private popUp: UtilService,
    private request: RequestManager,
    public dialogRef: MatDialogRef<ModalReduccionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Vinculaciones,
  ) {
    this.cambioVinculacion = new CambioVinculacion();
    this.cambioVinculacion.VinculacionOriginal = this.data;
    this.cambioVinculacion.DocPresupuestal = null;
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit(): void {
    /*
     * FUNCIONALIDAD DEFINITIVA QUE NO HA SALIDO A PROD
    this.request.get(
      environment.KRONOS_SERVICE,
      `documento_presupuestal/get_info_crp/${this.informacion.Vigencia}/${this.informacion.Disponibilidad}/${this.informacion.PersonaId}`,
    ).subscribe((response: DocumentoPresupuestal[]) => {
      this.registrosPresupuestales = response;
    });
    */

    /**
     * FUNCIONALIDAD TEMPORAL MIENTRAS kRONOS SALE A PROD
     */
    this.registrosPresupuestales = [];
    this.request.get(
      environment.SICAPITAL_JBPM_SERVICE,
      `cdprpdocente/${this.cambioVinculacion.VinculacionOriginal.Disponibilidad}/${this.cambioVinculacion.VinculacionOriginal.Vigencia}/${this.cambioVinculacion.VinculacionOriginal.PersonaId}`
    ).subscribe(response => {
      if (Object.keys(response.cdp_rp_docente).length > 0) {
        (response.cdp_rp_docente.cdp_rp as Array<any>).forEach(rp => {
          const reg = new DocumentoPresupuestal();
          reg.Consecutivo = parseInt(rp.rp, 10);
          reg.Vigencia = parseInt(rp.vigencia, 10);
          reg.Tipo = 'rp';
          this.registrosPresupuestales.push(reg);
        });
      }
    });
  }

  sumarHoras(): void {
    this.horasTotales = this.cambioVinculacion.VinculacionOriginal.NumeroHorasSemanales - this.cambioVinculacion.NumeroHorasSemanales;
  }

  calcularSemanas(): void {
    const fecha = moment(this.cambioVinculacion.FechaInicio).format('YYYY-MM-DD');
    this.popUp.loading();
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/consultar_semanas_restantes/${fecha}/${this.data.Vigencia}/${this.data.NumeroContrato}`
    ).subscribe({
      next: (respuesta: Respuesta) => {
        if (respuesta.Success) {
          const semanas = respuesta.Data as number;
          this.popUp.close();
          if (semanas <= 0) {
            this.cambioVinculacion.NumeroSemanas = null;
            this.popUp.warning('La fecha de inicio ingresada no es válida.');
          } else {
            this.cambioVinculacion.NumeroSemanas = semanas;
          }
        } else {
          this.cambioVinculacion.NumeroSemanas = null;
          this.popUp.close();
          this.popUp.error('No se ha podido calcular el numero de semanas.');
        }
      }, error: () => {
        this.cambioVinculacion.NumeroSemanas = null;
        this.popUp.close();
        this.popUp.error('No se ha podido calcular el numero de semanas.');
      }
    });
  }

  guardarCambios(): void {
    if (this.cambioVinculacion.NumeroSemanas > 0 && this.cambioVinculacion.NumeroSemanas <= this.data.NumeroSemanas) {
      this.popUp.confirm(
        'Registrar reducción',
        '¿Está seguro de registrar la reducción de horas?',
        'create'
      ).then(value => {
        if (value.isConfirmed) {
          this.cambioVinculacion.NumeroSemanas = parseInt(this.cambioVinculacion.NumeroSemanas.toString(), 10);
          this.dialogRef.close(this.cambioVinculacion);
        }
      });
    } else {
      this.popUp.warning('El número de semanas no es válido.');
    }
  }

  filtrarDias(d: any): boolean {
    const f = d === undefined ? new Date() : moment(d).toDate();
    return f.getDay() === 1;
  }

}

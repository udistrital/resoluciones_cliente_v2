import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { UtilService } from '../../services/utilService';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-adiciones',
  templateUrl: './modal-adiciones.component.html',
  styleUrls: ['./modal-adiciones.component.scss']
})
export class ModalAdicionesComponent {

  cambioVinculacion: CambioVinculacion;

  horasTotales: number;
  mostrar = false;

  constructor(
    private popUp: UtilService,
    private request: RequestManager,
    public dialogRef: MatDialogRef<ModalAdicionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Vinculaciones,
  ) {
    this.cambioVinculacion = new CambioVinculacion();
    this.cambioVinculacion.VinculacionOriginal = this.data;
    this.cambioVinculacion.DocPresupuestal = null;
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  sumarHoras(): void {
    const horasAdicion: string = this.cambioVinculacion.NumeroHorasSemanales.toString();
    this.horasTotales = this.cambioVinculacion.VinculacionOriginal.NumeroHorasSemanales + parseInt(horasAdicion, 10);
  }

  nuevaDisponibilidad(nuevaDisp: DocumentoPresupuestal): void {
    this.cambioVinculacion.DocPresupuestal = nuevaDisp;
  }

  mostrarDisponibilidad(): void {
    this.mostrar = !this.mostrar;
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
        'Registrar adición',
        '¿Está seguro de registrar la adición de horas?',
        'create'
      ).then(value => {
        if (value.isConfirmed) {
          this.cambioVinculacion.NumeroHorasSemanales = parseInt(this.cambioVinculacion.NumeroHorasSemanales.toString(), 10);
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

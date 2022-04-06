import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { UtilService } from '../../services/utilService';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';

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
    public dialogRef: MatDialogRef<ModalAdicionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Vinculaciones,
  ) {
    this.cambioVinculacion = new CambioVinculacion();
    this.cambioVinculacion.VinculacionOriginal = this.data;
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

  guardarCambios(): void {
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
  }

}

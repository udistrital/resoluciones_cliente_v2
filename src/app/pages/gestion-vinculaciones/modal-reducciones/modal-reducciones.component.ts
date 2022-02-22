import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';

@Component({
  selector: 'app-modal-reducciones',
  templateUrl: './modal-reducciones.component.html',
  styleUrls: ['./modal-reducciones.component.scss']
})
export class ModalReduccionesComponent implements OnInit {

  horasTotales: number;
  horasReducir = 0;
  semanasReducir = 0;
  fechaInicio: Date;
  registrosPresupuestales: any[];
  informacion: Vinculaciones;
  rpSeleccionado: number;

  constructor(
    public dialogRef: MatDialogRef<ModalReduccionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Vinculaciones,
  ) {
    this.informacion = data;
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close(false));
  }

  ngOnInit(): void {
  }

  sumarHoras(): void {
    this.horasTotales = this.data.NumeroHorasSemanales - this.horasReducir;
  }

  guardarCambios(): void {

  }

}

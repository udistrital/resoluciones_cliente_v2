import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';

@Component({
  selector: 'app-modal-adiciones',
  templateUrl: './modal-adiciones.component.html',
  styleUrls: ['./modal-adiciones.component.scss']
})
export class ModalAdicionesComponent implements OnInit {

  horasTotales: number;
  horasAdicionar = 0;
  semanasAdicionar = 0;
  fechaInicio: Date;
  informacion: Vinculaciones;
  disponibilidad = 0;
  mostrar = false;

  constructor(
    public dialogRef: MatDialogRef<ModalAdicionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Vinculaciones,
  ) {
    this.informacion = data;
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close(false));
  }

  ngOnInit(): void {
  }

  nuevaDisponibilidad(event): void { }

  mostrarDisponibilidad(): void {
    this.mostrar = !this.mostrar;
  }

  guardarCambios(): void { }

}

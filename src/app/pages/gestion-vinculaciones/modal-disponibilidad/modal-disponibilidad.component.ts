import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-disponibilidad',
  templateUrl: './modal-disponibilidad.component.html',
  styleUrls: ['./modal-disponibilidad.component.scss']
})
export class ModalDisponibilidadComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ModalDisponibilidadComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close(false));
  }

  ngOnInit(): void {
  }

  seleccionado(event): void { }

}

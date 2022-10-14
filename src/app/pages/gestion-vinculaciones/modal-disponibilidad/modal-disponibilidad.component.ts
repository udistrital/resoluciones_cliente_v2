import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-modal-disponibilidad',
  templateUrl: './modal-disponibilidad.component.html',
  styleUrls: ['./modal-disponibilidad.component.scss']
})
export class ModalDisponibilidadComponent implements OnInit {

  vigencia: number;
  valorContratos: string;
  disponibilidades: DocumentoPresupuestal[];
  tablas: Array<number>;

  constructor(
    public dialogRef: MatDialogRef<ModalDisponibilidadComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private popUp: UtilService,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
    this.vigencia = this.data.vigencia;
    this.valorContratos = this.data.total;
    this.tablas = new Array();
    this.tablas.push(0);
  }

  ngOnInit(): void {
    this.disponibilidades = [];
  }

  seleccionado(nuevaDisp: DocumentoPresupuestal, x: number): void {
    if (!this.disponibilidades?.[x]) {
      this.disponibilidades[x] = nuevaDisp;
    } else {
      const i = this.disponibilidades.findIndex(disp => disp && disp._id === nuevaDisp._id);
      if (i === -1 || i === x || this.disponibilidades.length <= 0) {
        this.disponibilidades[x] = nuevaDisp;
      } else {
        this.popUp.error('Debe elegir una disponibilidad diferente');
      }
    }
  }

  agregarTablas(): void {
    this.tablas.push(this.tablas.length);
  }

  quitarTabla(i: number): void {
    this.tablas.splice(i, 1);
    this.disponibilidades.splice(i, 1);
  }

  vincular(): void {
    this.popUp.confirm(
      'Vincular docentes',
      '¿Está seguro de vincular los docentes seleccionados con la disponibiilidad elegida?',
      'create'
    ).then(result => {
      if (result.isConfirmed) {
        this.dialogRef.close(this.disponibilidades);
      }
    });
  }

}

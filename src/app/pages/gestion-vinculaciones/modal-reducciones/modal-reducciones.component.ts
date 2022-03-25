import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';

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
      if (Object.keys(response.cdp_rp_docente.array.length > 0)) {
        response.cdp_rp_docente.cdp_rp.array.forEach(rp => {
          const reg = new DocumentoPresupuestal();
          reg.Consecutivo = parseInt(rp.rp, 10);
          reg.Vigencia = parseInt(rp.vigencia, 10);
          this.registrosPresupuestales.push(reg);
        });
      }
    });
  }

  sumarHoras(): void {
    this.horasTotales = this.cambioVinculacion.VinculacionOriginal.NumeroHorasSemanales - this.cambioVinculacion.NumeroHorasSemanales;
  }

  guardarCambios(): void {
    this.popUp.confirm(
      'Registrar reducción',
      '¿Está seguro de registrar la reducción de horas?',
      'create'
    ).then(value => {
      if (value.isConfirmed) {
        this.dialogRef.close(this.cambioVinculacion);
      }
    });
  }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { RpSeleccionado } from '../../models/rp_seleccionado';
import { Vinculaciones } from '../../models/vinculaciones';

@Component({
  selector: 'app-rp-selector',
  templateUrl: './rp-selector.component.html',
})
export class RpSelectorComponent implements OnInit {

  @Input() rowData: Vinculaciones;

  @Output() event: EventEmitter<RpSeleccionado> = new EventEmitter();

  rps: RpSeleccionado[];
  rpSeleccionado: RpSeleccionado;

  constructor(
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.rps = [];
    this.request.get(
      environment.SICAPITAL_JBPM_SERVICE,
      `cdprpdocente/${this.rowData.Disponibilidad}/${this.rowData.Vigencia}/${this.rowData.PersonaId}`
    ).subscribe(response => {
      if (Object.keys(response.cdp_rp_docente).length > 0) {
        (response.cdp_rp_docente.cdp_rp as Array<any>).forEach(rp => {
          const reg = new RpSeleccionado();
          reg.Consecutivo = parseInt(rp.rp, 10);
          reg.Vigencia = parseInt(rp.vigencia, 10);
          reg.VinculacionId = this.rowData.Id;
          this.rps.push(reg);
        });
      } else {
        //borrar para salir a producción
        const reg = new RpSeleccionado();
        reg.Consecutivo = Math.trunc(Math.random()*1000);
        reg.Vigencia = 2022;
        reg.VinculacionId = this.rowData.Id;
        this.rps.push(reg);
      }

    });
  }

  onSelect(event): void {
    this.rpSeleccionado = event.value
    if (this.rpSeleccionado === undefined) {
      this.rpSeleccionado = new RpSeleccionado();
      this.rpSeleccionado.VinculacionId = this.rowData.Id;
    }
    this.event.emit(this.rpSeleccionado);
  }

}

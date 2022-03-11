import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { RequestManager } from '../../services/requestManager';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { Rubro } from 'src/app/@core/models/rubro';
import { environment } from 'src/environments/environment';
import { MovimientoRubro } from 'src/app/@core/models/movimiento_rubro';

@Component({
  selector: 'app-tablas-disponibilidades',
  templateUrl: './tablas-disponibilidades.component.html',
  styleUrls: ['./tablas-disponibilidades.component.scss']
})
export class TablasDisponibilidadesComponent implements OnChanges {

  disponibilidadesSettings: any;
  disponibilidadesData: LocalDataSource;
  rubrosSettings: any;
  rubrosData: LocalDataSource;
  disponibilidadSeleccionada: DocumentoPresupuestal;
  rubrosSeleccionados: MovimientoRubro[];

  @Input()
  vigencia: number;

  @Output()
  seleccion = new EventEmitter<DocumentoPresupuestal>();

  constructor(
    private request: RequestManager,
  ) {
    this.disponibilidadesData = new LocalDataSource();
    this.rubrosData = new LocalDataSource();
    this.initTables();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.request.get(
      environment.KRONOS_SERVICE,
      `documento_presupuestal/get_doc_mov_rubro/${changes.vigencia.currentValue}/1/3-01-001-02`
    ).subscribe((response: DocumentoPresupuestal[]) => {
      this.disponibilidadesData.load(response);
    });
  }

  initTables(): void {
    this.disponibilidadesSettings = {
      columns: {
        Consecutivo: {
          title: 'Disponibilidad',
          width: '33%',
          editable: false,
        },
        Vigencia: {
          title: 'Vigencia',
          width: '33%',
          editable: false,
        },
        FechaRegistro: {
          title: 'Fecha de registro',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: string) => {
            return new Date(value).toLocaleDateString();
          },
        },
      },
      actions: false,
      mode: 'external'
    };

    this.rubrosSettings = {
      columns : {
        RubroDetalle: {
          title: 'Rubro',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: Rubro) => {
            return value.General.Nombre;
          },
        },
        ValorInicial: {
          title: 'Valor',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: number) => {
            const format = Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP'});
            return format.format(value);
          },
        },
        ValorActual: {
          title: 'Saldo',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: number) => {
            const format = Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP'});
            return format.format(value);
          },
        },
      },
      actions: false,
      hideSubHeader: true,
      mode: 'external',
      selectMode: 'multi'
    };
  }

  seleccionarDisponibilidad(event): void {
    this.disponibilidadSeleccionada = event.data;
    this.rubrosData.load(this.disponibilidadSeleccionada.Afectacion);
  }

  seleccionarRubros(event): void {
    this.rubrosSeleccionados = event.selected;
    this.disponibilidadSeleccionada.Afectacion = this.rubrosSeleccionados;
    this.seleccion.emit(this.disponibilidadSeleccionada);
  }

}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-tablas-disponibilidades',
  templateUrl: './tablas-disponibilidades.component.html',
  styleUrls: ['./tablas-disponibilidades.component.scss']
})
export class TablasDisponibilidadesComponent implements OnInit {

  disponibilidadesSettings: any;
  disponibilidadesData: LocalDataSource;
  rubrosSettings: any;
  rubrosData: LocalDataSource;

  @Output()
  seleccion = new EventEmitter<void>();

  constructor(
    private request: RequestManager,
  ) {
    this.disponibilidadesData = new LocalDataSource();
    this.rubrosData = new LocalDataSource();
    this.initTables();
  }

  ngOnInit(): void {
    // cargar datos
  }

  initTables(): void {
    this.disponibilidadesSettings = {
      columns: {
        Disponibilidad: {
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
        },
      },
      actions: false,
      mode: 'external'
    };

    this.rubrosSettings = {
      columns : {
        Rubro: {
          title: 'Rubro',
          width: '30%',
          editable: false,
        },
        Valor: {
          title: 'Valor',
          width: '30%',
          editable: false,
        },
        Saldo: {
          title: 'Saldo',
          width: '30%',
          editable: false,
        },
      },
      actions: false,
      hideSubHeader: true,
      mode: 'external',
      selectMode: 'multi'
    };
  }

  seleccionarDisponibilidad(event): void {

  }

  seleccionarRubros(event): void {
    this.seleccion.emit(event);
  }

}

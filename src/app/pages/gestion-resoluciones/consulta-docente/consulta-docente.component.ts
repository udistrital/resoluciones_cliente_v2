import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';

@Component({
  selector: 'app-consulta-docente',
  templateUrl: './consulta-docente.component.html',
  styleUrls: ['./consulta-docente.component.scss']
})
export class ConsultaDocenteComponent implements OnInit {

  resolucionesDocenteSettings: any;
  resolucionesDocenteData: LocalDataSource;
  documentoDocente = '';

  constructor() {
    this.initTable()
  }

  initTable(): void {
    this.resolucionesDocenteSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'documento',
            title: '<em class="material-icons" title="Ver documento">description</em>'
          },
        ],
      },
      noDataMessage: 'No hay resoluciones registradas en el sistema',
    };
  }

  ngOnInit(): void {
    this.resolucionesDocenteData = new LocalDataSource([
      {
        Id: 1,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Vinculación'
      },
      {
        Id: 2,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Cancelación'
      },
      {
        Id: 3,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Adición'
      },
      {
        Id: 4,
        NumeroResolucion: 123,
        Vigencia: 2020,
        Periodo: 1,
        Facultad: 'FACULTAD DE INGENIERIA',
        NivelAcademico: 'Pregrado',
        Dedicacion: 'HCH',
        Semanas: 12,
        Estado: 'Solicitada',
        TipoResolucion: 'Resolución de Reducción'
      },
    ]);
  }

  consultarDocente(): void {

  }

  eventHandler(event): void {
    console.log(event.data.Id)
  }

}

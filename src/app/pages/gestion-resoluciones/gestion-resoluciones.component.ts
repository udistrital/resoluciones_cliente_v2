import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';

@Component({
  selector: 'app-gestion-resoluciones',
  templateUrl: './gestion-resoluciones.component.html',
  styleUrls: [
    './gestion-resoluciones.component.scss',
    '../form-detalle-resolucion/form-detalle-resolucion.component.scss',
  ]
})
export class GestionResolucionesComponent implements OnInit {

  resolucionesSettings: any;
  resolucionesData: LocalDataSource;
  resolucionId = 0;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private router: Router,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.resolucionesData = new LocalDataSource([
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

  initTable(): void {
    this.resolucionesSettings = {
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
          {
            name: 'vincular',
            title: '<em class="material-icons" title="Vincular">person_add</em>'
          },
          {
            name: 'desvincular',
            title: '<em class="material-icons" title="Desvincular">person_remove</em>'
          },
          {
            name: 'adicionar',
            title: '<em class="material-icons" title="Adicionar">add_circle</em>'
          },
          {
            name: 'reducir',
            title: '<em class="material-icons" title="Reducir">remove_circle</em>'
          },
          {
            name: 'consultar',
            title: '<em class="material-icons" title="Consultar">list</em>'
          },
          {
            name: 'editar',
            title: '<em class="material-icons" title="Editar contenido">edit</em>'
          },
          {
            name: 'anular',
            title: '<em class="material-icons" title="Anular">cancel</em>'
          },
        ],
      },
      rowClassFunction: (row: any) => {
      },
      noDataMessage: 'No hay resoluciones registradas en el sistema',
    };
  }

  eventHandler(event: any): void {
    switch (event.action) {
      case 'documento':
        this.cargarDocumento(event.data.Id);
        break;
      case 'editar':
        this.editarResolución(event.data.Id);
        break;
      case 'anular':
        this.anularResolución(event.data.Id);
        break;
      case 'consultar':
        this.consultarVinculacionesResolución(event.data.Id);
        break;
      case 'vincular':
        this.vincularDocentesResolución(event.data.Id);
        break;
      case 'desvincular':
        this.desvincularDocentesResolución(event.data.Id);
        break;
      case 'adicionar':
        this.adicionarHorasDocentesResolución(event.data.Id);
        break;
      case 'reducir':
        this.reducirHorasDocentesResolución(event.data.Id);
        break;
    }
  }

  cargarDocumento(id: number): void {}

  editarResolución(id: number): void {
    this.router.navigate(['../detalle_resolucion', {Id: id}], { relativeTo: this.route});
  }

  anularResolución(id: number): void {}

  consultarVinculacionesResolución(id: number): void {}

  vincularDocentesResolución(id: number): void {}

  desvincularDocentesResolución(id: number): void {}

  adicionarHorasDocentesResolución(id: number): void {}

  reducirHorasDocentesResolución(id: number): void {}

  crearResolucion(): void {
    this.router.navigate(['../generacion_resolucion'], { relativeTo: this.route});
  }

  consultarDocente(): void {
    this.router.navigate(['../consulta_docente'], { relativeTo: this.route});
  }

}

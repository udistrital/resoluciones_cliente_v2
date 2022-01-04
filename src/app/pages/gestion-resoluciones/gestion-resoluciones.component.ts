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
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_resoluciones`
    ).subscribe((response) => {
      this.resolucionesData = new LocalDataSource(response.Data);
    });
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

  anularResolución(id: number): void {
    this.popUp.confirm(
      'Anular Resolución',
      '¿Está seguro que desea anular la resolución?',
      'delete'
    ).then(result => {
      if (result.isConfirmed) {
        this.request.delete(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones`,
          id
        ).subscribe(response => {
          if (response.Success) {
            this.popUp.success('La resolución ha sido anulada con éxito');
            this.ngOnInit();
          }
        });
      }
    });
  }

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

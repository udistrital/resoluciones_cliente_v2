import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServerDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
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
  resolucionesData: ServerDataSource;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private router: Router,
    private http: HttpClient,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.resolucionesData = new ServerDataSource(this.http, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones`,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
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
            name: 'cancelar',
            title: '<em class="material-icons" title="Cancelar">person_remove</em>'
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
            name: 'enviar',
            title: '<em class="material-icons" title="Enviar a revisión">send</em>'
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
      case 'cancelar':
        this.cancelarDocentesResolución(event.data.Id);
        break;
      case 'enviar':
        this.enviarRevision(event.data.Id);
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
        ).subscribe((response: Respuesta) => {
          if (response.Success) {
            this.popUp.success('La resolución ha sido anulada con éxito').then(() => {
              this.ngOnInit();
            });
          }
        });
      }
    });
  }

  consultarVinculacionesResolución(id: number): void {
    this.router.navigate(['../listar_vinculaciones', {Id: id, tipo: 'vista'}], { relativeTo: this.route });
  }

  vincularDocentesResolución(id: number): void {
    this.router.navigate(['../vincular_docentes', {Id: id}], { relativeTo: this.route });
  }

  cancelarDocentesResolución(id: number): void {
    this.router.navigate(['../cancelar_vinculaciones', {Id: id}], { relativeTo: this.route });
  }

  adicionarHorasDocentesResolución(id: number): void {
    this.router.navigate(['../listar_vinculaciones', {Id: id, tipo: 'adicion'}], { relativeTo: this.route });
  }

  reducirHorasDocentesResolución(id: number): void {
    this.router.navigate(['../listar_vinculaciones', {Id: id, tipo: 'reduccion'}], { relativeTo: this.route });
  }

  enviarRevision(Id: number): void {
    this.popUp.confirm(
      'Enviar a revisión',
      '¿Está seguro de enviar esta resolución a revisión?',
      'update'
    ).then(result => {
      if (result.isConfirmed) {
        const estado = {
          ResolucionId: Id,
          Estado: 'RAPR',
          Usuario: localStorage.getItem('user'),
        };
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_resoluciones/actualizar_estado`,
          estado
        ).subscribe((response: Respuesta) => {
          if (response.Success) {
            this.popUp.success('La resolución ha sido enviada a revisión con éxito').then(() => {
              this.ngOnInit();
            });
          }
        });
      }
    });
  }

  crearResolucion(): void {
    this.router.navigate(['../generacion_resolucion'], { relativeTo: this.route});
  }

  consultarDocente(): void {
    this.router.navigate(['../consulta_docente'], { relativeTo: this.route});
  }

}

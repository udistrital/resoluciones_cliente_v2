import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ServerDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { CheckboxAssistanceComponent } from 'src/app/@core/components/checkbox-assistance/checkbox-assistance.component';
import { environment } from 'src/environments/environment';
import { ModalDocumentoViewerComponent } from '../modal-documento-viewer/modal-documento-viewer.component';
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

  dialogConfig: MatDialogConfig;
  resolucionesSettings: any;
  resolucionesData: ServerDataSource;

  parametros: string = "";
  query: string = "query=Activo:true";
  cadenaFiltro: string[] = [];

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.resolucionesData = new ServerDataSource(this.http, {
      endPoint: environment.RESOLUCIONES_MID_V2_SERVICE + `gestion_resoluciones/resoluciones_inscritas?` + this.query + this.parametros,
      dataKey: 'Data',
      pagerPageKey: 'offset',
      pagerLimitKey: 'limit',
      totalKey: 'Total',
    });
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = '';
  }

  initTable(): void {
    TablaResoluciones["Acciones"] = {
      title: "Acciones",
      editable: true,
      filter: false,
      width: '4%',
      type: 'custom',
      renderComponent: CheckboxAssistanceComponent,
      onComponentInitFunction: (instance) => {
        instance.modulo = "gestion";
        instance.icon.subscribe(data => {
          this.eventHandler(data);
        });
      },
    }

    this.resolucionesSettings = {
      columns: TablaResoluciones,
      mode: 'external',
      actions: false,
      rowClassFunction: (row: any) => {
      },
      noDataMessage: 'No hay resoluciones registradas en el sistema',
    };
  }

  eventHandler(event): void {
    switch (event) {
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

  filtroTabla() {
    this.query = "query=Activo:true";
    this.parametros = "";
    if (this.cadenaFiltro[0] !== undefined && this.cadenaFiltro[0] !== "") {
      this.query = this.query.concat(",NumeroResolucion:" + this.cadenaFiltro[0]);
    }
    if (this.cadenaFiltro[1] !== undefined && this.cadenaFiltro[1] !== "") {
      this.query = this.query.concat(",Vigencia:" + this.cadenaFiltro[1]);
    }
    if (this.cadenaFiltro[2] !== undefined && this.cadenaFiltro[2] !== "") {
      this.query = this.query.concat(",Periodo=" + this.cadenaFiltro[2]);
    }
    if (this.cadenaFiltro[3] !== undefined && this.cadenaFiltro[3] !== "") {
      this.parametros = this.parametros.concat("&facultad=" + this.cadenaFiltro[3]);
    }
    if (this.cadenaFiltro[4] !== undefined && this.cadenaFiltro[4] !== "") {
      this.parametros = this.parametros.concat("&nivelA=" + this.cadenaFiltro[4]);
    }
    if (this.cadenaFiltro[5] !== undefined && this.cadenaFiltro[5] !== "") {
      this.parametros = this.parametros.concat("&dedicacion=" + this.cadenaFiltro[5]);
    }
    if (this.cadenaFiltro[6] !== undefined && this.cadenaFiltro[6] !== "") {
      this.query = this.query.concat(",NumeroSemanas=" + this.cadenaFiltro[6]);
    }
    if (this.cadenaFiltro[7] !== undefined && this.cadenaFiltro[7] !== "") {
      this.parametros = this.parametros.concat("&estadoRes=" + this.cadenaFiltro[7]);
    }
    if (this.cadenaFiltro[8] !== undefined && this.cadenaFiltro[8] !== "") {
      this.parametros = this.parametros.concat("&tipoRes=" + this.cadenaFiltro[8]);
    }
    this.ngOnInit();
  }

  limpiarFiltro() {
    for (let i in this.cadenaFiltro) {
      i = "";
    }
  }

  cargarDocumento(id: number): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_resoluciones/generar_resolucion/${id}`
    ).subscribe((response: Respuesta) => {
      if (response.Success) {
        this.dialogConfig.data = response.Data as string;
        this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
      }
    });
  }

  editarResolución(id: number): void {
    this.router.navigate(['../detalle_resolucion', { Id: id }], { relativeTo: this.route });
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
    this.router.navigate(['../listar_vinculaciones', { Id: id, tipo: 'vista' }], { relativeTo: this.route });
  }

  vincularDocentesResolución(id: number): void {
    this.router.navigate(['../vincular_docentes', { Id: id }], { relativeTo: this.route });
  }

  cancelarDocentesResolución(id: number): void {
    this.router.navigate(['../cancelar_vinculaciones', { Id: id }], { relativeTo: this.route });
  }

  adicionarHorasDocentesResolución(id: number): void {
    this.router.navigate(['../listar_vinculaciones', { Id: id, tipo: 'adicion' }], { relativeTo: this.route });
  }

  reducirHorasDocentesResolución(id: number): void {
    this.router.navigate(['../listar_vinculaciones', { Id: id, tipo: 'reduccion' }], { relativeTo: this.route });
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
    this.router.navigate(['../generacion_resolucion'], { relativeTo: this.route });
  }

  consultarDocente(): void {
    this.router.navigate(['../consulta_docente'], { relativeTo: this.route });
  }

}

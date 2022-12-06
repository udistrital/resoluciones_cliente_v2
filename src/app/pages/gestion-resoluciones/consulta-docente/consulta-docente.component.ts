import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { environment } from 'src/environments/environment';
import { ModalDocumentoViewerComponent } from '../../modal-documento-viewer/modal-documento-viewer.component';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-consulta-docente',
  templateUrl: './consulta-docente.component.html',
  styleUrls: ['./consulta-docente.component.scss']
})
export class ConsultaDocenteComponent {

  dialogConfig: MatDialogConfig;
  resolucionesDocenteSettings: any;
  resolucionesDocenteData: LocalDataSource;
  documentoDocente = '';

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.initTable();
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1200px';
    this.dialogConfig.height = '800px';
    this.dialogConfig.data = '';
  }

  initTable(): void {
    if (TablaResoluciones.Acciones !== undefined) {
      delete TablaResoluciones.Acciones;
    }
    TablaResoluciones.Estado.filter = false;
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
      selectedRowIndex: -1,
      noDataMessage: 'No hay resoluciones registradas en el sistema',
    };
    this.popUp.close();
  }

  consultarDocente(): void {
    this.popUp.loading();
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_resoluciones/consultar_docente/${this.documentoDocente}`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.popUp.close();
          this.resolucionesDocenteData = new LocalDataSource(response.Data);
          if (response.Data.length === 0) {
            this.popUp.error('No se encontraron resoluciones para el docente indicado.');
          }
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('No se han podido consultar las resoluciones del docente indicado.');
      }
    });
  }

  eventHandler(event: any): void {
    this.popUp.loading();
    this.request.get(
      environment.RESOLUCIONES_V2_SERVICE,
      `resolucion/${event.data.Id}`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          const resolucion = response.Data as Resolucion;
          this.request.get(
            environment.GESTOR_DOCUMENTAL_SERVICE,
            `document/${resolucion.NuxeoUid}`
          ).subscribe({
            next: response2 => {
              this.popUp.close();
              this.dialogConfig.data = response2.file as string;
              this.dialog.open(ModalDocumentoViewerComponent, this.dialogConfig);
            }, error: () => {
              this.popUp.close();
              this.popUp.error('No se ha podido generar la resolución.');
            }
          });
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('No se ha podido generar la resolución.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

}

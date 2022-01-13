import { Component } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TablaResoluciones } from 'src/app/@core/models/tabla_resoluciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-consulta-docente',
  templateUrl: './consulta-docente.component.html',
  styleUrls: ['./consulta-docente.component.scss']
})
export class ConsultaDocenteComponent {

  resolucionesDocenteSettings: any;
  resolucionesDocenteData: LocalDataSource;
  documentoDocente = '';

  constructor(
    private request: RequestManager,
  ) {
    this.initTable();
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

  consultarDocente(): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_resoluciones/consultar_docente/${this.documentoDocente}`
    ).subscribe(response => {
      if (response.Success) {
        this.resolucionesDocenteData = new LocalDataSource(response.Data);
      }
    });
  }

  eventHandler(event): void {
    // Abrir doc nuxeo
    console.log(event.data.Id);
  }

}

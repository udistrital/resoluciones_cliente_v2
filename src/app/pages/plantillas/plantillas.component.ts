import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';

@Component({
  selector: 'app-plantillas',
  templateUrl: './plantillas.component.html',
  styleUrls: ['./plantillas.component.scss'],
})
export class PlantillasComponent implements OnInit {

  plantillasSettings: any;
  plantillasData: LocalDataSource;
  selectedTab = 0;
  resolucionId = 0;
  copia = false;

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.popUp.loading();
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_plantillas`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.plantillasData = new LocalDataSource(response.Data);
          this.popUp.close();
        } else {
          this.popUp.close();
          this.popUp.error('No se han podido cargar las plantillas');
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('No se han podido cargar las plantillas');
      }
    });
  }

  initTable(): void {
    this.plantillasSettings = {
      columns: {
        Id: {
          hide: true,
        },
        Dedicacion: {
          title: 'Dedicacion',
          width: '15%',
          editable: false,
        },
        NivelAcademico: {
          title: 'Nivel Academico',
          width: '25%',
          editable: false,
        },
        Facultad: {
          title: 'Facultad',
          width: '30%',
          editable: false,
        },
        TipoResolucion: {
          title: 'Tipo de Resolucion',
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'editar',
            title: '<em class="material-icons" title="Editar plantilla">edit</em>',
          },
          {
            name: 'copiar',
            title: '<em class="material-icons" title="Copiar plantilla">file_copy</em>',
          },
          {
            name: 'borrar',
            title: '<em class="material-icons" title="Eliminar plantilla">delete</em>',
          },
        ]
      },
      add: {
        addButtonContent: '<i class="material-icons title="Agregar plantilla">add_circle_outline</i>',
      },
      noDataMessage: 'No hay plantillas de resoluciones registradas en el sistema',
    };
  }

  eventHandler(event: any): void {
    switch (event.action) {
      case 'editar':
        this.editPlantilla(event);
        break;
      case 'copiar':
        this.copyPlantilla(event);
        break;
      case 'borrar':
        this.deletePlantilla(event);
        break;
    }
  }

  copyPlantilla(event: any): void {
    this.setSelectedTab(1, false);
    this.copia = true;
    this.resolucionId = event.data.Id;
  }

  createPlantilla(): void {
    this.setSelectedTab(1, false);
    this.resolucionId = this.resolucionId === 0 ? undefined : 0;
  }

  editPlantilla(event: any): void {
    this.setSelectedTab(1, false);
    this.copia = false;
    this.resolucionId = event.data.Id;
  }

  deletePlantilla(event: any): void {
    this.popUp.confirm(
      'Eliminar plantilla',
      '¿Esta seguro que desea eliminar esta plantilla?',
      'delete'
    ).then(result => {
      if (result.isConfirmed) {
        this.request.delete(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_plantillas`,
          event.data.Id
        ).subscribe((response: Respuesta) => {
          if (response.Success) {
            this.popUp.success('La plantilla se ha eliminado con éxito.').then(() => {
              this.ngOnInit();
            });
          } else {
            this.popUp.error('No se ha podido eliminar la plantilla.');
          }
        });
      }
    });
  }

  setSelectedTab(tab: number, update: boolean): void {
    this.selectedTab = tab;
    this.resolucionId = 0;
    if (update) {
      this.ngOnInit();
    }
  }

}

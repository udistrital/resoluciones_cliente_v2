import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
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

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_plantillas`
    ).subscribe((response: any) => {
      this.plantillasData = new LocalDataSource(response.Data);
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
        position: 'right',
        columnTitle: 'Acciones',
      },
      add: {
        addButtonContent: '<i class="material-icons title="Agregar">add_circle_outline</i>',
      },
      edit: {
        editButtonContent: '<i class="material-icons" title="Editar">edit</i>',
      },
      delete: {
        deleteButtonContent: '<i class="material-icons" title="Eliminar">delete</i>',
      },
      noDataMessage: 'No hay plantillas de resoluciones registradas en el sistema',
    };
  }

  createPlantilla(): void {
    this.setSelectedTab(1, false);
    this.resolucionId = 0;
  }

  editPlantilla(event: any): void {
    this.setSelectedTab(1, false);
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
        ).subscribe((response: any) => {
          if (response.Status) {
            this.popUp.success('La plantilla se ha eliminado con éxito');
            this.ngOnInit();
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

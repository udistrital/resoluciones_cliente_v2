import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'app-plantillas',
  templateUrl: './plantillas.component.html',
  styleUrls: ['./plantillas.component.scss'],
})
export class PlantillasComponent implements OnInit {

  plantillasSettings: any;
  plantillasData: LocalDataSource;
  selectedTab: number = 0;
  resolucionId: number = 0;

  constructor() {
    this.initTable();
  }

  ngOnInit(): void {
    this.plantillasData = new LocalDataSource([
      {
        Id: 1,
        Dedicacion: 'HCH',
        NivelAcademico: 'PREGRADO',
        Facultad: 'FACULTAD DE INGENIERIA',
        TipoResolucion: 'Vinculación'
      },
    ]);
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
        columnTitle: "Acciones",
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
    this.setSelectedTab(1);
    this.resolucionId = 0;
  }

  editPlantilla(event: any): void {
    this.setSelectedTab(1);
    this.resolucionId = event.data.Id;
  }

  deletePlantilla(event: any): void {

  }

  setSelectedTab(tab: number): void {
    this.selectedTab = tab;
  }

}

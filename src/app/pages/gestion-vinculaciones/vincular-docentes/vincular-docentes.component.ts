import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-vincular-docentes',
  templateUrl: './vincular-docentes.component.html',
  styleUrls: ['./vincular-docentes.component.scss']
})
export class VincularDocentesComponent implements OnInit {

  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  cargaAcademicaSettings: any;
  cargaAcademicaData: LocalDataSource;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  docentesSeleccionados: any;
  vinculacionesSeleccionadas: any;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private popUp: UtilService,
  ) {
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.cargaAcademicaData = new LocalDataSource(); 
    this.vinculacionesData = new LocalDataSource(); 
    this.initTables();
    this.preloadData();
  }

  preloadData() {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `resolucion/${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          this.resolucion = response.Data as Resolucion;
        })
        this.request.get(
          environment.RESOLUCIONES_V2_SERVICE,
          `resolucion_vinculacion_docente/${this.resolucionId}`
        ).subscribe((response: Respuesta) => {
          this.resolucionVinculacion = response.Data as ResolucionVinculacionDocente;
        });
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      const params = `/${this.resolucion.Vigencia}/${this.resolucion.Periodo}/${this.resolucionVinculacion.Dedicacion}/${this.resolucionVinculacion.FacultadId}/${this.resolucionVinculacion.NivelAcademico}`
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/docentes_carga_horaria${params}`
      ).subscribe((response: Respuesta) => {
        if (response.Data.length > 0) {
          this.cargaAcademicaData.load(response.Data);
        } else {
          this.popUp.error('No se encontraron datos de carga académica');
        }
      });
  
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/docentes_previnculados/${this.resolucionId}`
      ).subscribe((response: Respuesta) => {
        this.vinculacionesData.load(response.Data);
      });
    }, 200)
    
  }

  initTables(): void {
    this.cargaAcademicaSettings = {
      columns: {
        docente_apellido: {
          title: 'Apellidos',
          width: '15%',
          editable: false,
        },
        docente_nombre: {
          title: 'Nombres',
          width: '15%',
          editable: false,
        },
        docente_documento: {
          title: 'Documento',
          width: '10%',
          editable: false,
        },
        horas_lectivas: {
          title: 'Horas',
          width: '5%',
          editable: false,
        },
        Emerito: {
          title: 'Emerito',
          width: '5%',
          editable: true,
        },
        proyecto_nombre: {
          title: 'Proyecto Curricular',
          width: '25%',
          editable: false,
        },
        CategoriaNombre: {
          title: 'Categoria',
          width: '10%',
          editable: false,
        },
        tipo_vinculacion_nombre: {
          title: 'Dedicación',
          width: '10%',
          editable: false,
        },
      },
      actions: false,
      selectMode: 'multi',
      mode: 'external'
    }

    this.vinculacionesSettings = {
      columns: TablaVinculaciones,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      hideSubHeader: true,
    }
  }
  abrirModalDisponibilidad(): void {

  }

  generarInformeCSV(): void {

  }

  generarInformePDF(): void {

  }

  desvincular(): void {

  }

  seleccionarDocentes(event): void {
    this.docentesSeleccionados = event.selected;
  }

  seleccionarVinculaciones(event): void {
    this.vinculacionesSeleccionadas = event.selected;
  }

}

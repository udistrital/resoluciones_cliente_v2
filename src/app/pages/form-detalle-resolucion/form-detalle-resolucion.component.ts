import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { ContenidoResolucion } from 'src/app/@core/models/contenido_resolucion';
import { Parametro } from 'src/app/@core/models/parametro';
import { NivelFormacion } from 'src/app/@core/models/nivel_formacion';
import { Articulo } from 'src/app/@core/models/articulo';
import { ComponenteResolucion } from 'src/app/@core/models/componente_resolucion';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { CuadroResponsabilidades } from 'src/app/@core/models/cuadro_responsabilidades';

@Component({
  selector: 'app-form-detalle-resolucion',
  templateUrl: './form-detalle-resolucion.component.html',
  styleUrls: ['./form-detalle-resolucion.component.scss'],
})
export class FormDetalleResolucionComponent implements OnInit, OnChanges {

  resolucionForm: any = {};
  contenidoResolucion: ContenidoResolucion;
  responsabilidadesSettings: any;
  responsabilidadesData: LocalDataSource;
  niveles: NivelFormacion[];
  dedicaciones: Parametro[];
  facultades: any[];
  tiposResoluciones: Parametro[];


  @Input()
  resolucionId: number;

  @Input()
  esPlantilla: boolean = false;

  constructor(
    private request: RequestManager,
  ) {
    this.initTable()
  }

  ngOnInit(): void {
    this.cargarDatos()
  }

  ngOnChanges(changes: SimpleChanges): void {
    switch (changes.resolucionId.currentValue) {
      case 0:
      case undefined:
        this.contenidoResolucion = new ContenidoResolucion();
        this.contenidoResolucion.Articulos = new Array();
        this.contenidoResolucion.Resolucion = new Resolucion();
        this.contenidoResolucion.Vinculacion = new ResolucionVinculacionDocente();
        const articulo = new Articulo();
        articulo.Paragrafos = new Array();
        this.contenidoResolucion.Articulos.push(articulo)
        break;
      default:
        this.cargarContenidoResolucion(changes.resolucionId.currentValue);
        break;
    }
  }

  initTable(): void {
    this.responsabilidadesSettings = {
      columns: {
        Funcion: {
          title: "Función",
          width: '20%',
        },
        Nombre: {
          title: "Nombre",
          width: '35%',
        },
        Cargo: {
          title: "Cargo",
          width: '30%',
        },
      },
      actions: {
        position: 'right',
      },
      add: {
        addButtonContent: '<i class="material-icons title="Agregar">add_circle_outline</i>',
        createButtonContent: '<i class="material-icons" title="Guardar">done</i>',
        cancelButtonContent: '<i class="material-icons" title="Cancelar">close</i>',
      },
      edit: {
        editButtonContent: '<i class="material-icons" title="Editar">edit</i>',
        saveButtonContent: '<i class="material-icons" title="Guardar">done</i>',
        cancelButtonContent: '<i class="material-icons" title="Cancelar">close</i>',
      },
      delete: {
        deleteButtonContent: '<i class="material-icons" title="Eliminar">delete</i>',
      },
      noDataMessage: 'No hay información de responsabilidades',
    }
    this.responsabilidadesData = new LocalDataSource();
  }

  cargarDatos(): void {
    this.request.get(
      environment.PARAMETROS_SERVICE, 
      `parametro?limit=0&query=ParametroPadreid.CodigoAbreviacion:DVE`
    ).subscribe((response: any) => {
      this.dedicaciones = response.Data;
    });

    this.request.get(
      environment.PARAMETROS_SERVICE, 
      `parametro?query=TipoParametroId.CodigoAbreviacion:TR`
    ).subscribe((response: any) => {
      this.tiposResoluciones = response.Data;
    });

    this.request.get(
      environment.OIKOS_SERVICE, 
      `dependencia_tipo_dependencia?query=TipoDependenciaId.Id:2&limit=0`
    ).subscribe((response: any) => {
      this.facultades = response;
    });

    this.request.get(
      environment.PROYECTOS_SERVICE,
      `nivel_formacion?limit=0`
    ).subscribe((response: NivelFormacion[]) => {
      this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null)
    });
  }

  cargarContenidoResolucion(Id: number): void {
    console.log(Id)
  }

  agregarArticulo(): void {
    const articulo = new Articulo();
    articulo.Paragrafos = new Array();
    this.contenidoResolucion.Articulos.push(articulo)
  }

  eliminarArticulo(a: number): void {
    this.contenidoResolucion.Articulos.splice(a, 1)
  }

  agregarParagrafo(i: number): void {
    const paragrafo = new ComponenteResolucion()
    this.contenidoResolucion.Articulos[i].Paragrafos.push(paragrafo)
  }

  eliminarParagrafo(i: number, j: number): void {
    this.contenidoResolucion.Articulos[i].Paragrafos.splice(j, 1)
  }

  guardarCambios(): void {
    this.responsabilidadesData.getAll().then((data: CuadroResponsabilidades) => {
      this.contenidoResolucion.Resolucion.CuadroResponsabilidades = data;
      console.log(this.contenidoResolucion)
    })
  }

  generarVistaPrevia(): void {
    
  }

  salir(): void {

  }

}

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ContenidoResolucion } from 'src/app/@core/models/contenido_resolucion';
import { Parametro } from 'src/app/@core/models/parametro';

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
  articulos: any[];
  paragrafos: any[];
  niveles: Parametro[];
  dedicaciones: Parametro[];
  facultades: any[];
  tiposResoluciones: Parametro[];


  @Input()
  resolucionId: number;

  constructor() {
    this.initTable()
  }

  ngOnInit(): void {
    this.articulos = [
      {
        texto: "",
        paragrafos: [
        ],
      },
      {
        texto: "",
        paragrafos: [
        ],
      }
    ]
  }

  ngOnChanges(changes: SimpleChanges): void {
    switch (changes.resolucionId.currentValue) {
      case 0:
      case undefined:
        this.contenidoResolucion = new ContenidoResolucion();
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
  }

  cargarContenidoResolucion(Id: number): void {
    console.log(Id)
  }

  agregarArticulo(): void {
    this.articulos.push({
      texto: "",
      paragrafos: [
      ],
    })
  }

  eliminarArticulo(a: number): void {
    this.articulos.splice(a, 1)
  }

  agregarParagrafo(i: number): void {
    this.articulos[i].paragrafos.push({texto: ""})
  }

  eliminarParagrafo(i: number, j: number): void {
    this.articulos[i].paragrafos.splice(j, 1)
  }

  guardarCambios(): void {

  }

  generarVistaPrevia(): void {
    
  }

  salir(): void {

  }

}

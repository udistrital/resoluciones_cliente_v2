import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'app-form-detalle-resolucion',
  templateUrl: './form-detalle-resolucion.component.html',
  styleUrls: ['./form-detalle-resolucion.component.scss'],
})
export class FormDetalleResolucionComponent implements OnInit {

  resolucionForm: any = {};
  responsabilidadesSettings: any;
  responsabilidadesData: LocalDataSource;
  articulos: number[];

  constructor() {
    this.initTable()
  }

  ngOnInit(): void {
    this.articulos = [1,2,3,4]
  }

  initTable() {
    this.responsabilidadesSettings = {
      columns: {
        Funcion: {
          title: "Función",
          width: '15%',
        },
        Nombre: {
          title: "Nombre",
          width: '25%',
        },
        Cargo: {
          title: "Cargo",
          width: '25%',
        },
        Firma: {
          title: 'Firma',
          width: '20%'
        }
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
    }
  }

  agregarArticulo() {
    this.articulos.push(this.articulos.length)
  }

  eliminarArticulo(a: number) {
    this.articulos.splice(a, 1)
  }

  agregarParagrafo() {

  }

  eliminarParagrafo() {

  }

  guardarCambios() {

  }

  salir() {

  }

}

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { RequestManager } from '../../services/requestManager';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { Rubro } from 'src/app/@core/models/rubro';
import { environment } from 'src/environments/environment';
import { MovimientoRubro } from 'src/app/@core/models/movimiento_rubro';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-tablas-disponibilidades',
  templateUrl: './tablas-disponibilidades.component.html',
  styleUrls: ['./tablas-disponibilidades.component.scss']
})
export class TablasDisponibilidadesComponent implements OnChanges {

  disponibilidadesSettings: any;
  disponibilidadesData: LocalDataSource;
  rubrosSettings: any;
  rubrosData: LocalDataSource;
  disponibilidadSeleccionada: DocumentoPresupuestal;
  rubrosSeleccionados: MovimientoRubro[];

  @Input()
  vigencia: number;

  @Output()
  seleccion = new EventEmitter<DocumentoPresupuestal>();

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
  ) {
    this.disponibilidadesData = new LocalDataSource();
    this.rubrosData = new LocalDataSource();
    this.initTables();
  }

  ngOnChanges(changes: SimpleChanges): void {
   /*
    * FUNCIONALIDAD DEFINITIVA QUE NO HA SALIDO A PROD
    this.request.get(
      environment.KRONOS_SERVICE,
      `documento_presupuestal/get_doc_mov_rubro/${changes.vigencia.currentValue}/1/3-01-001-02`
    ).subscribe((response: DocumentoPresupuestal[]) => {
      this.disponibilidadesData.load(response);
    });
    */

    /**
     * FUNCIONALIDAD TEMPORAL MIENTRAS kRONOS SALE A PROD
     */
    this.popUp.input(
      'Ingrese el número de CDP asignado',
      'Numero de disponibilidad'
    ).then(value => {
      if (value.isConfirmed) {
        this.request.get(
          environment.SICAPITAL_JBPM_SERVICE,
          `rubros_disponibilidad/${changes.vigencia.currentValue}/1/${value.value}`
        ).subscribe(response => {
          if (Object.keys(response.Rubros).length > 0) {
            const disponibilidades = new Array<DocumentoPresupuestal>();
            const disponibilidad = new DocumentoPresupuestal();
            disponibilidad.Consecutivo = parseInt(response.Rubros.Disponibilidad[0].numero_disponibilidad, 10);
            disponibilidad.Vigencia = parseInt(response.Rubros.Disponibilidad[0].vigencia, 10);
            disponibilidad.FechaRegistro = "";
            const rubros = new Array<MovimientoRubro>();
            response.Rubros.Disponibilidad.forEach(rubro => {
              const r = new MovimientoRubro();
              r.Padre = rubro.codigo;
              r.ValorInicial = parseInt(rubro.valor, 10);
              r.ValorActual = 0;
              r.RubroDetalle = new Rubro();
              r.RubroDetalle.General = {Nombre: rubro.codigo};
              rubros.push(r);
            });
            disponibilidad.Afectacion = rubros;
            disponibilidades.push(disponibilidad);
            this.disponibilidadesData.load(disponibilidades);
          } else {
            this.popUp.error('El número de disponibilidad ingresado no es correcto');
          }
        });
      }
    });
  }

  initTables(): void {
    this.disponibilidadesSettings = {
      columns: {
        Consecutivo: {
          title: 'Disponibilidad',
          width: '33%',
          editable: false,
        },
        Vigencia: {
          title: 'Vigencia',
          width: '33%',
          editable: false,
        },
        FechaRegistro: {
          title: 'Fecha de registro',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: string) => {
            if (value === "") {
              return 'No disponible';
            } else {
              return new Date(value).toLocaleDateString();
            }
          },
        },
      },
      actions: false,
      hideSubHeader: true,
      mode: 'external',
      selectedRowIndex: -1,
    };

    this.rubrosSettings = {
      columns : {
        RubroDetalle: {
          title: 'Rubro',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: Rubro) => {
            return value.General.Nombre;
          },
        },
        ValorInicial: {
          title: 'Valor',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: number) => {
            const format = Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP'});
            return format.format(value);
          },
        },
        ValorActual: {
          title: 'Saldo',
          width: '33%',
          editable: false,
          valuePrepareFunction: (value: number) => {
            const format = Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP'});
            return format.format(value);
          },
        },
      },
      actions: false,
      hideSubHeader: true,
      mode: 'external',
      selectMode: 'multi',
    };
  }

  seleccionarDisponibilidad(event): void {
    if (event.isSelected) {
      this.disponibilidadSeleccionada = event.data;
      this.rubrosData.load(this.disponibilidadSeleccionada.Afectacion);
    } else {
      this.disponibilidadSeleccionada = null;
      this.rubrosData = new LocalDataSource();
      this.rubrosSeleccionados = null;
    }
  }

  seleccionarRubros(event): void {
    this.rubrosSeleccionados = event.selected;
    this.disponibilidadSeleccionada.Afectacion = this.rubrosSeleccionados;
    this.seleccion.emit(this.disponibilidadSeleccionada);
  }

}

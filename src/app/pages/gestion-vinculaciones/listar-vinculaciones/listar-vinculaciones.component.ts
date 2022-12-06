import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { ModificacionResolucion } from 'src/app/@core/models/modificacion_resolucion';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalAdicionesComponent } from '../modal-adiciones/modal-adiciones.component';
import { ModalReduccionesComponent } from '../modal-reducciones/modal-reducciones.component';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';
import { Parametro } from 'src/app/@core/models/parametro';
import { first, forkJoin } from 'rxjs';

@Component({
  selector: 'app-listar-vinculaciones',
  templateUrl: './listar-vinculaciones.component.html',
  styleUrls: ['./listar-vinculaciones.component.scss']
})
export class ListarVinculacionesComponent implements OnInit {

  dialogConfig: MatDialogConfig;
  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  modificacionResolucion: ModificacionResolucion;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  tipoVista: string;
  tipoResolucion: Parametro;

  constructor(
    private request: RequestManager,
    private route: ActivatedRoute,
    private router: Router,
    private popUp: UtilService,
    private dialog: MatDialog,
  ) {
    this.vinculacionesData = new LocalDataSource();
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.tipoResolucion = new Parametro();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        this.preloadData();
      }
      if (params.get('tipo') !== null) {
        this.tipoVista = params.get('tipo');
        this.cargarVinculaciones();
      }
      this.initTable();
    });
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '800px';
    this.dialogConfig.height = '500px';
    this.dialogConfig.data = {};
  }

  preloadData(): void {
    forkJoin<[Respuesta, Respuesta]>([
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion/${this.resolucionId}`
      ).pipe(first()),
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `resolucion_vinculacion_docente/${this.resolucionId}`
      ).pipe(first()),
    ]).pipe().subscribe({
      next: ([resp1, resp2]: [Respuesta, Respuesta]) => {
        this.resolucion = resp1.Data as Resolucion;
        this.resolucionVinculacion = resp2.Data as ResolucionVinculacionDocente;
        this.request.get(
          environment.PARAMETROS_SERVICE,
          `parametro/${this.resolucion.TipoResolucionId}`
        ).subscribe({
          next: (response: Respuesta) => {
            this.tipoResolucion = response.Data as Parametro;
          }, error: () => {
            this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
          }
        });
      }, error: () => {
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
      }
    });
  }

  initTable(): void {
    this.vinculacionesSettings = {
      mode: 'external',
      columns: TablaVinculaciones,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Opciones',
        custom: [],
      },
      selectedRowIndex: -1,
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
    switch (this.tipoVista) {
      case 'vista':
        (this.vinculacionesSettings.actions.custom as Array<any>).push(
          {
            name: 'anular',
            title: '<em class="material-icons" title="Anular">cancel</em>'
          }
        );
        break;
      case 'adicion':
        (this.vinculacionesSettings.actions.custom as Array<any>).push(
          {
            name: 'adicionar',
            title: '<em class="material-icons" title="Adicionar">add_circle</em>'
          }
        );
        break;
      case 'reduccion':
        (this.vinculacionesSettings.actions.custom as Array<any>).push(
          {
            name: 'reducir',
            title: '<em class="material-icons" title="Reducir">remove_circle</em>'
          }
        );
        break;
    }
  }

  cargarVinculaciones(): void {
    if (this.tipoVista === 'vista') {
      this.cargarVinculacionesResolucion(this.resolucionId);
    } else {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `modificacion_resolucion?limit=0&query=ResolucionNuevaId.Id:${this.resolucionId}`
      ).subscribe((response: Respuesta) => {
        if (response.Success) {
          this.modificacionResolucion = (response.Data as ModificacionResolucion[])[0];
          this.cargarVinculacionesResolucion(this.modificacionResolucion.ResolucionAnteriorId.Id);
        }
      });
    }
  }

  cargarVinculacionesResolucion(resolucionId: number): void {
    this.popUp.loading();
    this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `gestion_vinculaciones/${resolucionId}`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.vinculacionesData.load(response.Data);
          this.popUp.close();
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
      }
    });
  }

  eventHandler(event: any): void {
    const vinculacion = event.data as Vinculaciones;
    switch (event.action) {
      case 'anular':
        this.popUp.confirm(
          'Anular vinculacion',
          '¿Desea confirmar la anulación de la vinculación seleccionada?',
          'delete'
        ).then(result => {
          if (result.isConfirmed) {
            this.popUp.loading();
            this.request.post(
              environment.RESOLUCIONES_MID_V2_SERVICE,
              'gestion_vinculaciones/desvincular_docentes',
              [vinculacion]
            ).subscribe((response: Respuesta) => {
              if (response.Success) {
                this.popUp.success('La vinculacion ha sido anulada').then(() => {
                  this.cargarVinculaciones();
                });
              }
            });
          }
        });
        break;

      case 'adicionar':
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_vinculaciones/consultar_semaforo_docente/${this.resolucion.VigenciaCarga}/${this.resolucion.PeriodoCarga}/${vinculacion.PersonaId}`,
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              if ((response.Data as string) == '') {
                this.popUp.warning('Se debe verificar el estado del semáforo para este docente.');
              } else {
                this.dialogConfig.data = vinculacion;
                const dialogAdicion = this.dialog.open(ModalAdicionesComponent, this.dialogConfig);
                dialogAdicion.afterClosed().subscribe((data: CambioVinculacion) => {
                  if (data) {
                    this.registrarModificacion(data);
                  }
                });
              }
            } else {
              this.popUp.error("No se ha podido realizar la consulta del semaforo.");
            }
          },
          error: () => {
            this.popUp.error("No se ha podido realizar la consulta del semaforo.");
          }
        });
        break;

      case 'reducir':
        this.request.get(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          `gestion_vinculaciones/consultar_semaforo_docente/${this.resolucion.VigenciaCarga}/${this.resolucion.PeriodoCarga}/${vinculacion.PersonaId}`,
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              if ((response.Data as string) == '') {
                this.popUp.warning('Se debe verificar el estado del semáforo para este docente.')
              } else {
                this.dialogConfig.data = vinculacion;
                const dialogReduccion = this.dialog.open(ModalReduccionesComponent, this.dialogConfig);
                dialogReduccion.afterClosed().subscribe((data: CambioVinculacion) => {
                  if (data) {
                    this.registrarModificacion(data);
                  }
                });
              }
            } else {
              this.popUp.error("No se ha podido realizar la consulta del semaforo.");
            }
          },
          error: () => {
            this.popUp.error("No se ha podido realizar la consulta del semaforo.");
          }
        });
        break;
    }
  }

  registrarModificacion(cambios: CambioVinculacion): void {
    const objetoModificacion = {
      CambiosVinculacion: cambios,
      ResolucionNuevaId: this.resolucionVinculacion,
      ModificacionResolucionId: this.modificacionResolucion.Id,
    };
    this.popUp.loading();
    this.request.post(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      'gestion_vinculaciones/modificar_vinculacion',
      objetoModificacion
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success) {
          this.popUp.close();
          this.popUp.success(response.Message).then(() => {
            this.cargarVinculaciones();
          });
        } else {
          this.popUp.close();
          this.popUp.error('No se ha podido registrar la modificación de la vinculacion.');
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('No se ha podido registrar la modificación de la vinculacion.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}

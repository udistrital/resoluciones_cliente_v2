import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource, Ng2SmartTableComponent } from 'ng2-smart-table';
import { CambioVinculacion } from 'src/app/@core/models/cambio_vinculacion';
import { DocumentoPresupuestal } from 'src/app/@core/models/documento_presupuestal';
import { ModificacionResolucion } from 'src/app/@core/models/modificacion_resolucion';
import { Resolucion } from 'src/app/@core/models/resolucion';
import { ResolucionVinculacionDocente } from 'src/app/@core/models/resolucion_vinculacion_docente';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaVinculaciones } from 'src/app/@core/models/tabla_vinculaciones';
import { Vinculaciones } from 'src/app/@core/models/vinculaciones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UtilService } from '../../services/utilService';
import { first, forkJoin } from 'rxjs';
import { Parametro } from 'src/app/@core/models/parametro';
import * as moment from 'moment';

@Component({
  selector: 'app-cancelar-vinculaciones',
  templateUrl: './cancelar-vinculaciones.component.html',
  styleUrls: ['./cancelar-vinculaciones.component.scss']
})
export class CancelarVinculacionesComponent implements OnInit {

  @ViewChild('table') smartTable: Ng2SmartTableComponent
  selectedRow;

  resolucionId: number;
  resolucion: Resolucion;
  resolucionVinculacion: ResolucionVinculacionDocente;
  modificacionResolucion: ModificacionResolucion;
  vinculacionesSettings: any;
  vinculacionesData: LocalDataSource;
  vinculacionesSeleccionadas: Vinculaciones[];
  registrosPresupuestales: any;
  cambioVinculacion: CambioVinculacion[];
  cambioVincTemp: CambioVinculacion[];
  numeroSemanas: number;
  numeroHorasSemestrales: number;
  numeroHorasSemes: number[];
  tipoResolucion: Parametro;
  parametros: any;
  semanasMaximo: string;
  vinculacionesTotales: any;
  posgrado: boolean;

  constructor(
    private request: RequestManager,
    private router: Router,
    private route: ActivatedRoute,
    private popUp: UtilService,
  ) {
    this.resolucion = new Resolucion();
    this.resolucionVinculacion = new ResolucionVinculacionDocente();
    this.tipoResolucion = new Parametro();
    this.vinculacionesData = new LocalDataSource();
    this.vinculacionesSeleccionadas = [];
    this.cambioVinculacion = [];
    this.cambioVincTemp = [];
    this.initTable();
    this.loadData();
  }

  initTable(): void {
    this.vinculacionesSettings = {
      columns: TablaVinculaciones,
      actions: false,
      selectMode: 'multi',
      mode: 'external',
      noDataMessage: 'No hay vinculaciones asociadas a esta resolución',
    };
  }

  loadData(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
        this.popUp.loading();
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
            console.log("res ", this.resolucion)
            this.resolucionVinculacion = resp2.Data as ResolucionVinculacionDocente;
            console.log(this.resolucionVinculacion)
            if (this.resolucionVinculacion.NivelAcademico == 'POSGRADO') this.posgrado = true;
            else this.posgrado = false;
            this.request.get(
              environment.RESOLUCIONES_V2_SERVICE,
              `modificacion_resolucion?limit=0&query=ResolucionNuevaId.Id:${this.resolucionId}`
            ).subscribe({
              next: (response: Respuesta) => {
                if (response.Success) {
                  this.modificacionResolucion = (response.Data as ModificacionResolucion[])[0];
                  this.request.get(
                    environment.RESOLUCIONES_MID_V2_SERVICE,
                    `gestion_vinculaciones/${this.modificacionResolucion.ResolucionAnteriorId.Id}`
                  ).subscribe({
                    next: (response2: Respuesta) => {
                      if (response2.Success) {
                        this.vinculacionesData.load(response2.Data);
                        // console.log(this.vinculacionesData)
                        this.popUp.close();
                      }
                    }, error: () => {
                      this.popUp.close();
                      this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
                    }
                  });
                } else {
                  this.popUp.close();
                  this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
                }
              }, error: () => {
                this.popUp.close();
                this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
              }
            });
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
            this.popUp.close();
            this.popUp.error('Ha ocurrido un error, comuniquese con el área de soporte.');
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.registrosPresupuestales = {};
    this.parametros = {};
    this.semanasMaximo = "";
  }

  async getVinculaciones (nueva: Vinculaciones, event: any) {
    return new Promise((resolve, reject) => {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `vinculacion_docente?query=personaId:${nueva.PersonaId},numeroRp:${nueva.RegistroPresupuestal},vigencia:${nueva.Vigencia}`
      ).subscribe(response => {
        const vinculaciones : Vinculaciones[] = this.vinculacionesData['data']
        // console.log("vinculaciones ", vinculaciones)
        var vinculaciones_rp = vinculaciones.filter(x => x.RegistroPresupuestal == nueva.RegistroPresupuestal && x.Id != nueva.Id)
        vinculaciones_rp.forEach(v_rp => {
          const vinculacion = new CambioVinculacion();
          vinculacion.VinculacionOriginal = v_rp;
          vinculacion.NumeroSemanas = 0;
          vinculacion.NumeroHorasSemanales = 0;
          // console.log("v_rp ", v_rp)
          this.cambioVincTemp.push(vinculacion);
          var id = event.source.data.indexOf(v_rp)
          // console.log(id)
          let selectedElement: Element = document.querySelectorAll('ng2-smart-table table tbody tr').item(id)
          if (selectedElement) {
            let row: HTMLElement = selectedElement.querySelector('td') as HTMLElement;
            row.click();
            this.selectedRow = this.smartTable.grid.getSelectedRows().length;
          }
        });
        // Revisa otras vinculaciones asociadas para cancelar
        // console.log(response)
        response.Data.forEach(r => {
          // console.log("R ", r)
          this.request.get(
            environment.PARAMETROS_SERVICE,
            `parametro?query=tipoParametroId__codigoAbreviacion:TR`
          ).subscribe(responseTR => {
            this.parametros = responseTR.Data
          })
          this.request.get(
            environment.RESOLUCIONES_V2_SERVICE,
            `resolucion/${r.ResolucionVinculacionDocenteId.Id}`
          ).subscribe(response2 => {
            console.log(response2)
            console.log(this.parametros)
          })
        });
        resolve(response)
        // console.log("ASD ", this.cambioVincTemp)
        this.cambioVincTemp.forEach(element => {
          var aux1 = this.cambioVinculacion.filter(x => x.VinculacionOriginal.Id == element.VinculacionOriginal.Id)
          if (aux1.length == 0) this.cambioVinculacion.push(element)
        });
      });
    })
  }

  async seleccionarVinculaciones(event): Promise<void> {
    const nueva = event.data as Vinculaciones;
    var original: boolean = false
    var contains = this.cambioVincTemp.find(x => x.VinculacionOriginal.Id == nueva.Id)
    // console.log("CONTAINS ", contains)
    // console.log("EVENT ", event)
    if (event.isSelected as boolean) {
      // console.log("ORIGINAL")
      if (this.cambioVincTemp.length == 0 || contains == undefined) {
        const vinculacion = new CambioVinculacion();
        vinculacion.VinculacionOriginal = nueva;
        vinculacion.NumeroSemanas = 0;
        vinculacion.NumeroHorasSemanales = 0;
        this.cambioVincTemp.push(vinculacion);
        // console.log("prueba ", this.cambioVincTemp)
        this.calcularSemanasSugeridas(nueva);
        if (!(nueva.PersonaId in this.registrosPresupuestales)) {
          this.registrosPresupuestales[nueva.PersonaId] = [];
        }
        this.request.get(
          environment.SICAPITAL_JBPM_SERVICE,
          `cdprpdocente/${nueva.Disponibilidad}/${nueva.Vigencia}/${nueva.PersonaId}`
        ).subscribe(response => {
          if (Object.keys(response.cdp_rp_docente).length > 0) {
            (response.cdp_rp_docente.cdp_rp as Array<any>).forEach(rp => {
              const reg = new DocumentoPresupuestal();
              reg.Consecutivo = parseInt(rp.rp, 10);
              reg.Vigencia = parseInt(rp.vigencia, 10);
              reg.Tipo = 'rp';
              //this.registrosPresupuestales[nueva.PersonaId].push(reg);
            });
          }
        });
        this.vinculacionesTotales = await this.getVinculaciones(nueva, event);
      }
      // console.log("ASD1 ", this.cambioVincTemp)
      await this.otrasVinculaciones(original, nueva)
      this.cambioVincTemp = []
      // console.log("ASD2 ", this.cambioVincTemp)
    } else {
      // console.log("ELSE")
      const i = this.cambioVinculacion.findIndex(v => v.VinculacionOriginal.Id === nueva.Id);
      this.cambioVinculacion.splice(i, 1);
      delete this.registrosPresupuestales[nueva.PersonaId];
      const vinculaciones : Vinculaciones[] = this.vinculacionesData['data']
      var vinculaciones_rp = this.cambioVinculacion.filter(x => x.VinculacionOriginal.RegistroPresupuestal == nueva.RegistroPresupuestal)
      // console.log("VINCULACIONES RP ", vinculaciones_rp)
      if (vinculaciones_rp.length > 0){
        var id = event.source.data.indexOf(vinculaciones_rp[0].VinculacionOriginal)
        let selectedElement: Element = document.querySelectorAll('ng2-smart-table table tbody tr').item(id)
        if (selectedElement) {
          let row: HTMLElement = selectedElement.querySelector('td') as HTMLElement;
          row.click();
          this.selectedRow = this.smartTable.grid.getSelectedRows().length;
          console.log(this.selectedRow)
        }
      }
      var desvinc = this.cambioVinculacion.filter(x => x.VinculacionOriginal.PersonaId == nueva.PersonaId)
      for (let i = 0; i < desvinc.length; i++) {
        const index = this.cambioVinculacion.findIndex(v => v.VinculacionOriginal.Id === desvinc[i].VinculacionOriginal.Id);
        this.cambioVinculacion.splice(index, 1);
      }
      // console.log("TERMINA ", this.cambioVinculacion)
    }
  }

  async otrasCancelaciones(responseMod: Respuesta, vinc: CambioVinculacion, original: boolean): Promise<void> {
    var idAux = 0
    var rp = 0
    return new Promise((resolve, reject) => {
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `modificacion_resolucion/${responseMod.Data[0].ModificacionResolucionId.Id}`
      ).subscribe({
        next: (responseModRes: Respuesta) => {
          // console.log("RESPONSE MOD RES ", responseModRes)
          if (original) { 
            idAux = responseModRes.Data.ResolucionAnteriorId.Id
            rp = responseMod.Data[0].VinculacionDocenteCanceladaId.NumeroRp
          } else {
            idAux = responseModRes.Data.ResolucionNuevaId.Id
            rp = responseMod.Data[0].VinculacionDocenteRegistradaId.NumeroRp
          }
          this.request.get(
            environment.RESOLUCIONES_V2_SERVICE,
            `vinculacion_docente?query=persona_id:${vinc.VinculacionOriginal.PersonaId},ResolucionVinculacionDocenteId:${idAux},numeroRp:${rp},activo:true`
          ).subscribe({
            next : (responseVinDoc: Respuesta) => {
              console.log("RESPONSE VIN DOC" , responseVinDoc)
              if (responseVinDoc.Data.length > 0) {
                this.request.get(
                  environment.RESOLUCIONES_MID_V2_SERVICE,
                  `gestion_vinculaciones/${responseVinDoc.Data[0].ResolucionVinculacionDocenteId.Id}`
                ).subscribe({
                  next : (responseGesVin: Respuesta) => {
                    // console.log("RESPONSE GES VIN ", responseGesVin)
                    var gestion_vinc = (responseGesVin.Data).filter(x => x.PersonaId == responseMod.Data[0].VinculacionDocenteCanceladaId.PersonaId)
                    // console.log("gest vinc ", gestion_vinc)
                    for (let i = 0; i < gestion_vinc.length; i++) {
                      const vinculacion = new CambioVinculacion();
                      vinculacion.VinculacionOriginal = gestion_vinc[i];
                      vinculacion.NumeroSemanas = 0;
                      vinculacion.  NumeroHorasSemanales = 0;
                      this.cambioVincTemp.push(vinculacion);
                    }
                    this.cambioVincTemp.forEach(element => {
                      var aux1 = this.cambioVinculacion.filter(x => x.VinculacionOriginal.Id == element.VinculacionOriginal.Id)
                      if (aux1.length == 0) this.cambioVinculacion.push(element)
                    });
                    // console.log("CLOSE ", this.cambioVinculacion)
                    this.popUp.close();
                  }, error: () => {
                    this.popUp.close()
                    this.popUp.error('Error al consultar otras vinculaciones');
                  }
                })
              } else {
                this.popUp.close()
              }
            }, error: () => {
              this.popUp.close()
              this.popUp.error('Error al consultar otras vinculaciones');
            }
          })
        }, error: () => {
          this.popUp.close()
          this.popUp.error('Error al consultar otras vinculaciones');
        }
      })
    })
  }

  async otrasVinculaciones(original: boolean, nueva: Vinculaciones) {
    this.cambioVincTemp.forEach(vinc => {
      // console.log("vinc ", vinc)
      this.request.get(
        environment.RESOLUCIONES_V2_SERVICE,
        `modificacion_vinculacion?query=VinculacionDocenteRegistradaId:${vinc.VinculacionOriginal.Id}`
      ).subscribe({
        next: async (responseMod: Respuesta) => {
          console.log("RESPONSE MOD ", responseMod)
          if (responseMod.Success && responseMod.Data.length != 0) {
            original = true;
            await this.otrasCancelaciones(responseMod, vinc, original)
          } else {
            // console.log("AUX ", this.vinculacionesTotales)
            var aux = this.vinculacionesTotales.Data.filter(x => x.Id != nueva.Id && x.Activo == false)
            // console.log("aux ", aux)
            aux.forEach(vinculacion => {
              this.request.get(
                environment.RESOLUCIONES_V2_SERVICE,
                `modificacion_vinculacion?query=VinculacionDocenteCanceladaId:${vinculacion.Id}`
              ).subscribe({
                next: async (responseMod: Respuesta) => {
                  // console.log("RESPONSE MOD 2 ", responseMod)
                  if (responseMod.Success && responseMod.Data.length != 0) {
                    original = false;
                    await this.otrasCancelaciones(responseMod, vinc, original)
                  } else {
                    this.popUp.close()
                  }
                }
              })
            });
            if (aux.length == 0) {
              this.popUp.close()
            }
          }
        }, error: () => {
          this.popUp.close()
          this.popUp.error('Error al consultar otras vinculaciones');
        }
      })
    })
  }

  cancelarVinculaciones(): void {
    for (const cambio of this.cambioVinculacion) {
      cambio.NumeroSemanas = this.numeroSemanas;
    }
    /*if (this.resolucionVinculacion.NivelAcademico === 'PREGRADO') {
    } else {
      for (const cambio of this.cambioVinculacion) {
        //cambio.NumeroHorasSemanales = this.numeroHorasSemestrales;
        cambio.NumeroSemanas = cambio.VinculacionOriginal.NumeroSemanas;
      }
    }*/
    const objetoCancelaciones = {
      CambiosVinculacion: this.cambioVinculacion,
      ResolucionNuevaId: this.resolucionVinculacion,
      ModificacionResolucionId: this.modificacionResolucion.Id,
    };

    this.popUp.confirm(
      'Desvincular docentes',
      '¿Está seguro de realizar la desvinculación de los docentes seleccionados?',
      'create'
    ).then(value => {
      if (value.isConfirmed) {
        this.popUp.loading();
        this.request.post(
          environment.RESOLUCIONES_MID_V2_SERVICE,
          'gestion_vinculaciones/desvincular',
          objetoCancelaciones
        ).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              this.popUp.close();
              this.popUp.success(response.Message).then(() => {
                this.cambioVinculacion = [];
                this.registrosPresupuestales = {};
                this.loadData();
              });
            }
          }, error: () => {
            this.popUp.close();
            this.popUp.error('No se han podido registrar las cancelaciones.');
          }
        });
      }
    });
  }

  calcularSemanasSugeridas(vinc: Vinculaciones): void {
    if (this.semanasMaximo === '') {
      const fecha = moment(new Date()).format('YYYY-MM-DD');
      this.popUp.loading();
      this.request.get(
        environment.RESOLUCIONES_MID_V2_SERVICE,
        `gestion_vinculaciones/consultar_semanas_restantes/${fecha}/${vinc.Vigencia}/${vinc.NumeroContrato}`
      ).subscribe({
        next: (respuesta: Respuesta) => {
          const semanas = respuesta.Data as number;
          this.semanasMaximo = Math.max(0, Math.min(vinc.NumeroSemanas, semanas)).toString();
        }, error: () => {
          this.semanasMaximo = '';
          this.popUp.close();
          this.popUp.error('No se ha podido calcular el numero de semanas sugerido.');
        }
      });

    }
  }

  salir(): void {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}

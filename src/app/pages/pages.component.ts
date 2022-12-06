import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RequestManager } from './services/requestManager';
import { UserService } from './services/userService';
import { DatosIdentificacion } from '../@core/models/datos_identificacion';
import { Tercero } from '../@core/models/tercero';
import { VinculacionTercero } from '../@core/models/vinculacion_tercero';

@Component({
  selector: 'app-pages',
  template: `<div *ngIf="loaded" class="main-container">
              <div class="username-info">Bienvenido <br>{{terceroName}}</div>
              <router-outlet></router-outlet>
            </div>`,
})
export class PagesComponent implements OnInit {
  loaded = false;
  userData: any;
  terceroName = '';

  constructor(
    private userService: UserService,
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.loaded = true;

    this.userService.user$.subscribe((data: any) => {
      if (data ? data.userService ? data.userService.documento ? true : false : false : false) {
        this.request.get(
          environment.TERCEROS_SERVICE,
          `datos_identificacion?query=Numero:${data.userService.documento}`
        ).subscribe({
          next: (datosIdentificacion: DatosIdentificacion[]) => {
            const tercero: Tercero = datosIdentificacion[0].TerceroId;
            this.terceroName = tercero ? tercero.NombreCompleto ? tercero.NombreCompleto : '' : '';
            this.userService.updateTercero(tercero);
            this.request.get(
              environment.TERCEROS_SERVICE,
              `vinculacion?limit=0&order=desc&sortby=Id&query=Activo:true,TerceroPrincipalId.Id:${tercero.Id}`
            ).subscribe({
              next: (vinculacion: VinculacionTercero[]) => {
                const data2 = vinculacion[0];
                this.userService.updateVinculacion(data2);
              }, error: () => {
                this.userService.updateVinculacion(null);
              }
            });
          }, error: () => {
            this.userService.updateTercero(null);
            this.userService.updateVinculacion(null);
          }
        });
      }
    });
  }
}

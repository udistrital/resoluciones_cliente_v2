import { Component, OnInit } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RequestManager } from './services/requestManager';
import { UserService } from './services/userService';
import { DatosIdentificacion } from '../@core/models/datos_identificacion';
import { Tercero } from '../@core/models/tercero';
import { VinculacionTercero } from '../@core/models/vinculacion_tercero';
import Swal from 'sweetalert2';

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
  environment: any;
  loadingRouter: boolean;
  terceroName = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private request: RequestManager,
  ) {
    this.environment = environment;
    router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        Swal.fire({
          title: 'Cargando módulo ...',
          html: `Por favor espere`,
          showConfirmButton: false,
          allowOutsideClick: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });
        this.loadingRouter = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingRouter = false;
        Swal.close();
      } else {
        Swal.close();
      }
    });
  }

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

import { Component, OnInit } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from './services/requestManager';
import { UserService } from './services/userService';
import { DatosIdentificacion } from '../@core/models/datos_identificacion';

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
  terceroName: string = '';
 

  constructor(    private router: Router, private userService:UserService,
    private request: RequestManager ) {
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

    this.userService.user$.subscribe((data: any)=> {
      if(data?data.userService?data.userService.documento?true:false:false:false) {
        this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion?query=Numero:`+ data.userService.documento)
        .subscribe((datosIdentificacion: DatosIdentificacion)=> {
          let tercero = datosIdentificacion[0].TerceroId;
          this.terceroName = tercero?tercero.NombreCompleto?tercero.NombreCompleto:'':'';
          this.userService.updateTercero(tercero);
        })
      }
    })
  }
}

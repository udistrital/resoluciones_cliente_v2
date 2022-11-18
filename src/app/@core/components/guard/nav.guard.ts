import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { UtilService } from 'src/app/pages/services/utilService';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavGuard implements CanActivate {

  constructor(
    private router: Router,
    private request: RequestManager,
    private popUp: UtilService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.popUp.loading();
    return this.request.get(
      environment.CONFIGURACION_SERVICE,
      `parametro?query=Aplicacion.Nombre:${environment.appname}`
    ).pipe(
      map((response: any[]) => {
        const granted = response[0].Valor === "true"
        if (!granted) {
          this.popUp.close();
          this.popUp.warning('El sistema se encuentra cerrado temporalmente.').then(() => {
            this.router.navigateByUrl('pages/dashboard');
          });
        }
        return granted;
      })
    );
  }
  
}

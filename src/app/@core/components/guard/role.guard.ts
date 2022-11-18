import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { UtilService } from 'src/app/pages/services/utilService';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private router: Router,
    private request: RequestManager,
    private popUp: UtilService,
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const ruta = route.url[0].path;
    const user = JSON.parse(atob(localStorage.getItem('user')));
    const roles = Array(user.user.role).join(',').replace('Internal/everyone,', '');
    return this.request.get(
      environment.CONF_MENU_SERVICE,
      `${roles}/${environment.appname}`
    ).pipe(
      map((response: any[]) => {
        let autorizado = false;
        response.forEach(opcion => {
          autorizado ||= (opcion.Url as string).indexOf(ruta) !== -1;
        });
        if (!autorizado) {
          this.popUp.warning('No tiene acceso al módulo solicitado.').then(() => {
            this.router.navigateByUrl('pages/dashboard');
          });
        }
        return autorizado;
      })
    );
  }
  
}

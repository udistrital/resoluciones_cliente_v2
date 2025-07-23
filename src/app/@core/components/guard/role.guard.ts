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
    const fullPath = state.url;
    const user = JSON.parse(atob(localStorage.getItem('user')));
    for (let i = 0; i < user.user.role.length; i++) {
      user.user.role[i] = user.user.role[i].replace("/", "_")
    }
    const roles = Array(user.user.role).join(',');
    if (user.user.role.includes('ADMIN_DOCENCIA')) {
      if (fullPath.includes('/pages/gestion_resoluciones/consulta_docente')) {
        return true; // Allow access to consulta_docente
      } else if (fullPath.includes('/pages/gestion_resoluciones') && !fullPath.includes('/consulta_docente')) {
        this.popUp.warning('No tiene acceso al módulo solicitado.').then(() => {
          this.router.navigateByUrl('pages/dashboard');
        });
        return false;
      }
    }
    return this.request.get(
      environment.CONF_MENU_SERVICE,
      `${roles}/${environment.appname}`
    ).pipe(
      map((response: any[]) => {
        let autorizado = false;
        response.forEach(opcion => {
          autorizado ||= (opcion.Url as string).indexOf(ruta) !== -1;
          if (opcion.Opciones != null) {
            opcion.Opciones.forEach(opc => {
              autorizado ||= (opc.Url as string).indexOf(ruta) !== -1;
            });
          }
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

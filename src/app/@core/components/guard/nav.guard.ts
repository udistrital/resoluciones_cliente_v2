import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, catchError, of, finalize } from 'rxjs';
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
  ): Observable<boolean | UrlTree> {
    this.popUp.loading();

    return this.request.get(
      environment.CONFIGURACION_SERVICE,
      `parametro?query=Aplicacion.Nombre:${environment.appname}`
    ).pipe(
      map((response: any[]) => {
        if (!response?.length) {
          this.popUp.warning('No se encontró configuración para esta aplicación.');
          this.router.navigateByUrl('pages/dashboard');
          return false;
        }

        const granted = response[0]?.Valor === 'true';

        if (!granted) {
          this.popUp.warning('El sistema se encuentra cerrado temporalmente.');
          this.router.navigateByUrl('pages/dashboard');
        }

        return granted;
      }),
      catchError(() => {
        this.popUp.warning('Error al verificar acceso.');
        this.router.navigateByUrl('pages/dashboard');
        return of(false);
      }),
      finalize(() => {
        this.popUp.close();
      })
    );
  }
}

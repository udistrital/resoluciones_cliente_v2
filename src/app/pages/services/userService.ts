import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Tercero } from 'src/app/@core/models/tercero';
import { VinculacionTercero } from 'src/app/@core/models/vinculacion_tercero';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject(null);
  public user$ = this.userSubject.asObservable();

  private terceroSubject = new BehaviorSubject(null);
  public tercero$ = this.terceroSubject.asObservable();
  public terceroData = new Tercero();

  private dependenciaSubject = new BehaviorSubject(null);
  public dependenciaUser$ = this.dependenciaSubject.asObservable();
  public dependenciaData = new VinculacionTercero();

  constructor() { }

  updateUser(dataUser): void {
    this.userSubject.next(dataUser);
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  getUserDocument(): string | null {
    const user = this.getCurrentUser();
    if (user) {
      if (user.userService && user.userService.documento) {
        return user.userService.documento;
      }
      if (user.documento) {
        return user.documento;
      }
      if (user.document) {
        return user.document;
      }
      if (user.identificacion) {
        return user.identificacion;
      }
    }
    return null;
  }

  isUserAuthenticated(): boolean {
    return this.getUserDocument() !== null;
  }

  updateTercero(data: Tercero): void {
    if (data) {
      this.terceroData = { ...this.terceroData, ...data };
    } else {
      this.terceroData = new Tercero();
    }
    this.terceroSubject.next(this.terceroData);
  }

  updateVinculacion(data: VinculacionTercero): void {
    if (data) {
      this.dependenciaData = { ...this.dependenciaData, ...data };
    } else {
      this.dependenciaData = new VinculacionTercero();
    }
    this.dependenciaSubject.next(this.dependenciaData);
  }
}

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Tercero } from 'src/app/@core/models/tercero';
import { VinculacionTercero } from 'src/app/@core/models/vinculacion_tercero';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    private userSubject = new BehaviorSubject({});
    public user$ = this.userSubject.asObservable();

    private terceroSubject = new BehaviorSubject({});
    public tercero$ = this.terceroSubject.asObservable();
    public terceroData = new Tercero();

    private dependenciaSubject = new BehaviorSubject({});
    public dependenciaUser$ = this.dependenciaSubject.asObservable();
    public dependenciaData = new VinculacionTercero();

    constructor() {}

    updateUser(dataUser): void {
        this.userSubject.next(dataUser);
    }

    updateTercero(data: Tercero): void {
      this.terceroData = {...this.terceroData, ...data};
      this.terceroSubject.next(this.terceroData);
    }

    updateVinculacion(data: VinculacionTercero): void {
      this.dependenciaData = {...this.dependenciaData, ...data};
      this.dependenciaSubject.next(this.dependenciaData);
    }
}

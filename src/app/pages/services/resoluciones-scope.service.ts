import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import { RequestManager } from './requestManager';
import { UserService } from './userService';

export interface DependenciaUsuario {
  codigo_dependencia: number;
  id_oikos: number;
  nombre?: string;
  rol?: string;
}

export interface AlcanceUsuario {
  rol_principal: string;
  es_global: boolean;
  dependencias: DependenciaUsuario[];
}

export interface UsuarioResolucionesContext {
  numeroDocumento: string;
  rolesUsuario: string[];
  rolesParam: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResolucionesScopeService {
  private readonly rolesPermitidos = [
    'ADMINISTRADOR_RESOLUCIONES',
    'ASIS_FINANCIERA',
    'DECANO',
    'ASISTENTE_DECANATURA',
  ];

  constructor(
    private request: RequestManager,
    private userService: UserService,
  ) {}

  getUsuarioContext(): UsuarioResolucionesContext | null {
    const user = this.userService.getCurrentUser();

    if (!user) {
      return null;
    }

    const numeroDocumento = this.userService.getUserDocument() || '';
    const rolesUsuario = this.normalizarRoles(user?.userService?.role || user?.role || []);

    return {
      numeroDocumento,
      rolesUsuario,
      rolesParam: rolesUsuario.join(','),
    };
  }

  getAlcanceUsuario(numeroDocumento: string, rolesParam: string): Observable<AlcanceUsuario> {
    const query =
      `?roles=${encodeURIComponent(rolesParam)}` +
      `&numero_documento=${encodeURIComponent(numeroDocumento)}`;

    return this.request.get(
      environment.RESOLUCIONES_MID_V2_SERVICE,
      `resoluciones_por_rol/dependencias${query}`,
    ).pipe(
      map((response: Respuesta) => {
        if (!response?.Success) {
          throw response;
        }

        return (response.Data || {
          rol_principal: '',
          es_global: false,
          dependencias: [],
        }) as AlcanceUsuario;
      }),
    );
  }

  getDependenciaInicial(esGlobal: boolean, dependencias: DependenciaUsuario[]): number | null {
    if (!esGlobal && dependencias.length === 1) {
      return Number(dependencias[0].id_oikos);
    }

    return null;
  }

  private normalizarRoles(roles: string[] | string): string[] {
    const rolesNormalizados = Array.isArray(roles)
      ? roles
      : (typeof roles === 'string' && roles.trim() ? [roles] : []);

    return rolesNormalizados
      .map((rol: string) => String(rol).trim().toUpperCase())
      .filter((rol: string) => !!rol && this.rolesPermitidos.includes(rol));
  }
}

import { CuadroResponsabilidades } from "./cuadro_responsabilidades";

export class Resolucion {
    Id: number;
    NumeroResolucion: string;
    FechaExpedicion: Date;
    Vigencia: number;
    DependenciaId: number;
    TipoResolucionId: number;
    PreambuloResolucion: string;
    ConsideracionResolucion: string;
    NumeroSemanas: number;
    Periodo: number;
    Titulo: string;
    DependenciaFirmaId: number;
    VigenciaCarga: number;
    PeriodoCarga: number;
    CuadroResponsabilidades: string;
    NuxeoUid: string;
    Activo: Boolean;
    FechaCreacion: string;
    FechaModificacion: string;
}

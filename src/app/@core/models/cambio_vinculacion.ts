import { DocumentoPresupuestal } from './documento_presupuestal';
import { Vinculaciones } from './vinculaciones';

export class CambioVinculacion {
    NumeroHorasSemanales: number;
    NumeroSemanas: number;
    FechaInicio: string;
    DocPresupuestal: DocumentoPresupuestal;
    VinculacionOriginal: Vinculaciones;
}

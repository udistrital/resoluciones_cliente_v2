import { MovimientoRubro } from './movimiento_rubro';

export class DocumentoPresupuestal {
    _id: string;
    Tipo: string;
    AfectacionIds: string[];
    Afectacion: MovimientoRubro[];
    FechaRegistro: string;
    Estado: string;
    ValorActual: number;
    ValorInicial: number;
    Vigencia: number;
    Consecutivo: number;
}

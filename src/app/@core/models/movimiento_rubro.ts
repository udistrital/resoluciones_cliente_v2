import { Rubro } from './rubro';

export class MovimientoRubro {
    _id: string;
    IDPsql: number;
    Tipo: string;
    Padre: string;
    FechaRegistro: string;
    Estado: string;
    ValorActual: number;
    ValorInicial: number;
    RubroDetalle: Rubro;
}

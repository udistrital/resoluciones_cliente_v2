import { Articulo } from './articulo';
import { Resolucion } from './resolucion';
import { ResolucionVinculacionDocente } from './resolucion_vinculacion_docente';

export class ContenidoResolucion {
    Resolucion: Resolucion;
    Articulos: Articulo[];
    Vinculacion: ResolucionVinculacionDocente;
    Usuario: string;
    ResolucionAnteriorId: number;
}

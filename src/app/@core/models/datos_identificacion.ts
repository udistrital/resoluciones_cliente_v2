import { Tercero } from './tercero';
import { TipoDocumento } from './tipo_documento';

export class DatosIdentificacion {
  Id: number;
  TipoDocumentoId: TipoDocumento;
  TerceroId: Tercero;
  Numero: string;
  FechaExpedicion: string;
}

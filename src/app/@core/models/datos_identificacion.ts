import { Tercero } from './tercero';
import { TipoDocumento } from './tipo_documento';

export class DatosIdentificacion {
  Id: number;
  TipoDocumentoId: TipoDocumento;
  TerceroId: Tercero;
  Numero: string;
  //DigitoVerificacion: number; 
  //CiudadExpedicion: number;  
  FechaExpedicion: string;
  //DocumentoSoporte: number;
}
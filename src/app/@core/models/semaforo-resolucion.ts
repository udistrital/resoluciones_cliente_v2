export interface EstadoSemaforoVinculacion {
  vinculacion_id: number;
  numero_documento: number;
  numero_contrato: string;
  vigencia: number;
  numero_rp: number;
  vigencia_rp: number;
  tiene_rp_resoluciones: boolean;
  tiene_rp_titan: boolean;
  estado_codigo: 'COMPLETO' | 'PENDIENTE_TITAN' | 'SIN_RP';
  estado_nombre: string;
  prioridad: number;
}

export interface ResumenSemaforoResolucion {
  resolucion_id: number;
  total: number;
  total_con_rp: number;
  completas: number;
  pendientes_titan: number;
  sin_rp: number;
  porcentaje_completas: number;
  porcentaje_pendientes_titan: number;
  porcentaje_sin_rp: number;
}

export interface SemaforoResolucionData {
  resumen: ResumenSemaforoResolucion;
  detalle: EstadoSemaforoVinculacion[];
}

export interface RespuestaSemaforoResolucion {
  Success: boolean;
  Status: number;
  Message: string;
  Data: SemaforoResolucionData;
}

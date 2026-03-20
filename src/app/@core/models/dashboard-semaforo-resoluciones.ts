export interface ResumenDashboardResolucion {
  resolucion_id: number;
  numero_resolucion: string;
  vigencia: number;
  dependencia_id: number;
  dependencia_nombre: string;
  total: number;
  total_con_rp: number;
  completas: number;
  pendientes_titan: number;
  sin_rp: number;
  porcentaje_completas: number;
  porcentaje_pendientes_titan: number;
  porcentaje_sin_rp: number;
  estado_general_codigo: string;
  estado_general_nombre: string;
}

export interface ResumenGlobalDashboardResoluciones {
  total_resoluciones: number;
  resoluciones_completas: number;
  resoluciones_con_pendientes_titan: number;
  resoluciones_con_sin_rp: number;
  porcentaje_resoluciones_completas: number;
}

export interface DashboardSemaforoResolucionesData {
  resumen_global: ResumenGlobalDashboardResoluciones;
  resoluciones: ResumenDashboardResolucion[];
  total: number;
  limit: number;
  offset: number;
}

export interface RespuestaDashboardSemaforoResoluciones {
  Success: boolean;
  Status: number;
  Message: string;
  Data: DashboardSemaforoResolucionesData;
}

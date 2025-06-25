export class ReporteFinanciera {
    Id: number;
    Resolucion: string;
    Vigencia: number;
    Periodo: number;
    NivelAcademico: string;
    TipoVinculacion: string;
    TipoResolucion: string;
    DocumentoDocente: number;
    Nombre: string;
    Facultad: string;
    CodigoProyecto: number;
    ProyectoCurricular: string;
    Horas: number;
    Semanas: number;
    Cdp: number;
    Rp: number;
    Total: number;
    Sueldobasico: number;
    Primanavidad: number;
    Vacaciones: number;
    Primavacaciones: number;
    Cesantias: number;
    Interesescesantias: number;
    Primaservicios: number;
    Bonificacionservicios: number;
}
export const ReporteFinancieraExcel: any = {
    Id: { hide: true },
    Resolucion: { title: 'Resolución', width: '20%', editable: false },
    Vigencia: { title: 'Vigencia', width: '10%', editable: false },
    Periodo: { title: 'Periodo', width: '10%', editable: false },
    NivelAcademico: { title: 'Nivel Académico', width: '15%', editable: false },
    TipoVinculacion: { title: 'Tipo Vinculación', width: '15%', editable: false },
    TipoResolucion: { title: 'Tipo Resolución', width: '15%', editable: false },
    DocumentoDocente: { title: 'Documento', width: '15%', editable: false },
    Nombre: { title: 'Nombre', width: '25%', editable: false },
    Facultad: { title: 'Facultad', width: '20%', editable: false },
    CodigoProyecto: { title: 'Código Proyecto', width: '15%', editable: false },
    ProyectoCurricular: { title: 'Proyecto Curricular', width: '20%', editable: false },
    Horas: { title: 'Horas', width: '10%', editable: false },
    Semanas: { title: 'Semanas', width: '10%', editable: false },
    Cdp: { title: 'CDP', width: '10%', editable: false },
    Rp: { title: 'RP', width: '10%', editable: false },
    Total: { title: 'Total', width: '15%', editable: false },
    Sueldobasico: { title: 'Sueldo Básico', width: '15%', editable: false },
    Primanavidad: { title: 'Prima Navidad', width: '15%', editable: false },
    Vacaciones: { title: 'Vacaciones', width: '15%', editable: false },
    Primavacaciones: { title: 'Prima Vacaciones', width: '15%', editable: false },
    Cesantias: { title: 'Cesantías', width: '15%', editable: false },
    Interesescesantias: { title: 'Intereses Cesantías', width: '15%', editable: false },
    Primaservicios: { title: 'Prima Servicios', width: '15%', editable: false },
    Bonificacionservicios: { title: 'Bonificación Servicios', width: '15%', editable: false }
};

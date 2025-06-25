export class ReporteFinanciera {
    Id: number;
    Resolucion: string;
    Vigencia: number;
    Periodo: number;
    NivelAcademico: string;
    TipoVinculacion: string;
    DocumentoDocente: number;
    Nombre: string;
    CodigoFacultad: number;
    Facultad: string;
    CodigoProyecto: number;
    ProyectoCurricular: string;
    Horas: number;
    Semanas: number;
    Total: number;
    Cdp: number;
    Rp: number;
    TipoResolucion: string;
    SueldoBasico: number;
    PrimaNavidad: number;
    Vacaciones: number;
    PrimaVacaciones: number;
    Cesantias: number;
    InteresesCesantias: number;
    PrimaServicios: number;
    BonificacionServicios: number;
}

export const ReporteFinancieraExcel: any = {
    Id: {
        hide: true,
    },
    Resolucion: {
        title: 'Resolución',
        width: '20%',
        editable: false,
    },
    Vigencia: {
        title: 'Vigencia',
        width: '10%',
        editable: false,
    },
    Periodo: {
        title: 'Periodo',
        width: '10%',
        editable: false,
    },
    NivelAcademico: {
        title: 'Nivel Académico',
        width: '15%',
        editable: false,
    },
    TipoVinculacion: {
        title: 'Tipo Vinculación',
        width: '15%',
        editable: false,
    },
    DocumentoDocente: {
        title: 'Documento',
        width: '15%',
        editable: false,
    },
    Nombre: {
        title: 'Nombre',
        width: '20%',
        editable: false,
    },
    CodigoFacultad: {
        title: 'Código Facultad',
        width: '15%',
        editable: false,
    },
    Facultad: {
        title: 'Facultad',
        width: '15%',
        editable: false,
    },
    CodigoProyecto: {
        title: 'Código Proyecto',
        width: '15%',
        editable: false,
    },
    ProyectoCurricular: {
        title: 'Proyecto Curricular',
        width: '20%',
        editable: false,
    },
    Horas: {
        title: 'Horas',
        width: '10%',
        editable: false,
    },
    Semanas: {
        title: 'Semanas',
        width: '10%',
        editable: false,
    },
    Cdp: {
        title: 'CDP',
        width: '10%',
        editable: false,
    },
    Rp: {
        title: 'RP',
        width: '10%',
        editable: false,
    },
    TipoResolucion: {
        title: 'Tipo Resolución',
        width: '15%',
        editable: false,
    },
    Total: {
        title: 'Total',
        width: '15%',
        editable: false,
    },
    SueldoBasico: {
        title: 'Sueldo Básico',
        width: '15%',
        editable: false,
    },
    PrimaNavidad: {
        title: 'Prima Navidad',
        width: '15%',
        editable: false,
    },
    Vacaciones: {
        title: 'Vacaciones',
        width: '15%',
        editable: false,
    },
    PrimaVacaciones: {
        title: 'Prima Vacaciones',
        width: '15%',
        editable: false,
    },
    Cesantias: {
        title: 'Cesantías',
        width: '15%',
        editable: false,
    },
    InteresesCesantias: {
        title: 'Intereses Cesantías',
        width: '15%',
        editable: false,
    },
    PrimaServicios: {
        title: 'Prima Servicios',
        width: '15%',
        editable: false,
    },
    BonificacionServicios: {
        title: 'Bonificación Servicios',
        width: '15%',
        editable: false,
    }
};

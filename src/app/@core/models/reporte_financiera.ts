export class ReporteFinanciera {
    Id: number;
    Resolucion: string;
    Nombre: string;
    Cedula: number;
    Facultad: string;
    CodigoProyecto: number;
    ProyectoCurricular: string;
    Horas: number;
    Semanas: number;
    Cdp: number;
    Total: number;
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
        width: '25%',
        editable: false,
    },
    Nombre: {
        title: 'Nombre',
        width: '25%',
        editable: false,
    },
    PersonaId: {
        title: 'Documento',
        width: '15%',
        editable: false,
    },
    Facultad: {
        title: 'Facultad',
        width: '15%',
        editable: false,
    },
    CodigoProyecto: {
        title: 'Codigo Proyecto',
        width: '15%',
        editable: false,
    },
    ProyectoCurricular: {
        title: 'Proyecto Curricular',
        width: '15%',
        editable: false,
    },
    Horas: {
        title: 'Horas',
        width: '11%',
        editable: false,
    },
    NumeroSemanas: {
        title: 'Semanas',
        width: '11%',
        editable: false,
    },
    Disponibilidad: {
        title: 'Disponibilidad',
        width: '11%',
        editable: false,
    },
    ValorTotal: {
        title: 'Total',
        width: '15%',
        editable: false,
    },
    SueldoBasico: {
        title: 'Sueldo Basico',
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
        title: 'Cesantias',
        width: '15%',
        editable: false,
    },
    InteresesCesantias: {
        title: 'Intereses Cesantias',
        width: '15%',
        editable: false,
    },
    PrimaServicios: {
        title: 'Prima Servicios',
        width: '15%',
        editable: false,
    },
    BonificacionServicios: {
        title: 'Bonificacion Servicios',
        width: '15%',
        editable: false,
    }
};

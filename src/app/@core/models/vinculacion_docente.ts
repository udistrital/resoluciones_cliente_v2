import { ResolucionVinculacionDocente } from "./resolucion_vinculacion_docente";

export class VinculacionDocente {
    Id: number;
	NumeroContrato: string;
	Vigencia: number;
	PersonaId: number;
	NumeroHorasSemanales:number;
	NumeroSemanas: number;
	PuntoSalarialId: number;
	SalarioMinimoId: number;
	ResolucionVinculacionDocenteId: ResolucionVinculacionDocente;
	DedicacionId: number;
	ProyectoCurricularId: number;
	ValorContrato: number;
	Categoria: string;
	Emerito: boolean;
	DependenciaAcademica: number;
	NumeroRp: number;
	VigenciaRp: number;
	FechaInicio: Date;
	Activo: boolean;
	FechaCreacion: string;
	FechaModificacion: string;
	NumeroHorasTrabajadas: number
}

export interface IClientRequest {
	name: string;
	archived?: boolean;
}

export const clientRequestValidator = (data: any): IClientRequest => {
	if (!data.name || typeof data.name !== "string") {
		throw new Error("El nombre es requerido y debe ser un texto");
	}

	const cleanName = data.name.trim() as string;

	if (cleanName.length === 0) {
		throw new Error("El nombre no puede estar vacío");
	}

	if (cleanName.length > 100) {
		throw new Error("El nombre no puede exceder 100 caracteres");
	}

	return { name: cleanName, archived: data?.archived };
};

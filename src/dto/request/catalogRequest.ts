export interface ICatalogRequest {
	name: string;
}

export const catalogRequestValidator = (data: any): ICatalogRequest => {
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

	return { name: cleanName };
};

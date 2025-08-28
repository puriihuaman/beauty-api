import type { Request, Response } from "express";
import type { CatalogRequestDto } from "../domain/dto/index.ts";
import {
	addCatalog,
	editCatalog,
	getACatalog,
	getAllCampaign,
	removeCatalog,
} from "../services/index.ts";
import {
	cachedAsync,
	capitalizeFirstLetter,
	ClientError,
	handleError,
	handleResponse,
} from "../utils/index.ts";

export const getAllCatalogs = cachedAsync(
	async (req: Request, res: Response) => {
		const results = await getAllCampaign();

		handleResponse(res, 200, results, "Catálogos recuperados");
	}
);

export const getCatalogById = cachedAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const catalogId = id.trim();

		if (!catalogId) {
			throw handleError(
				res,
				400,
				"ID es requerido",
				"El ID del catálogo es requerido"
			);
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(catalogId)) {
			throw handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID es inválido"
			);
		}

		const response = await getACatalog(catalogId);

		handleResponse(res, 200, response, "Catálogo recuperado");
	}
);

export const createCatalog = cachedAsync(
	async (req: Request, res: Response) => {
		const { name }: CatalogRequestDto = req.body;
		const cleanName = name.trim();

		if (!cleanName) {
			handleError(
				res,
				400,
				"Nombre es requerido",
				"El nombre del catálogo es requerido"
			);
		}

		const catalog = await addCatalog({
			name: capitalizeFirstLetter(cleanName),
		});
		handleResponse(res, 201, catalog, "Catálogo creado con éxito");
	}
);

export const updateCatalog = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const { name }: CatalogRequestDto = req.body;

	const cleanName = name.trim();
	const catalogId = id.trim();

	if (!cleanName || !catalogId) {
		throw new ClientError("ID y Nombre del catálogo son requeridos", 400, "");
	}

	const notionIdRegex =
		/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

	if (!notionIdRegex.test(catalogId)) {
		throw handleError(res, 400, "ID inválido", "El formato del ID es inválido");
	}

	if (cleanName.length > 50) {
		throw new ClientError(
			"El Nombre del catálogo es demasiado largo",
			400,
			"El tamaño del nombre del catálogo no debería superar los 50 caracteres"
		);
	}

	const catalog = await editCatalog({
		id: catalogId,
		name: capitalizeFirstLetter(cleanName),
	});
	handleResponse(res, 200, catalog, "Catálogo actualizado con éxito");
};

export const deleteCatalog = cachedAsync(
	async (req: Request, res: Response) => {
		// try {
		const id = req.params.id as string;
		const catalogId = id.trim();

		if (!catalogId) {
			throw new ClientError(
				"El ID es requerido",
				400,
				"El ID del catálogo es requerido"
			);
		}

		const catalog = await removeCatalog(catalogId);
		handleResponse(res, 204, catalog, "Catálogo eliminado con éxito.");
	}
);

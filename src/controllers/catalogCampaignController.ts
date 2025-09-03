import type { Request, Response } from "express";
import type { CatalogCampaignDto } from "../dto/index.ts";
import {
	addCatalogCampaign,
	getAllCatalogCampaigns,
	getCatalogCampaign,
	removeCatalogCampaign,
} from "../services/index.ts";
import { cachedAsync, handleError, handleResponse } from "../utils/index.ts";

export const getAllCampaignCatalogs = cachedAsync(
	async (req: Request, res: Response) => {
		const results = await getAllCatalogCampaigns();

		handleResponse(res, 200, results, "Catálogo Campañas recuperado con éxito");
	}
);

export const getCampaignCatalogById = cachedAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const catalogCampaignId = id.trim();

		if (!catalogCampaignId) {
			handleError(
				res,
				400,
				"El ID es requerido",
				"El ID de Catálogo Campaña es requerido"
			);
			return;
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(catalogCampaignId)) {
			handleError(res, 400, "ID inválido", "El formato del ID es inválido");
			return;
		}
		const catalogCampaign = await getCatalogCampaign(catalogCampaignId);
		handleResponse(
			res,
			200,
			catalogCampaign,
			"Catálogo Campaña recuperado con éxito"
		);
	}
);

export const createCampaignCatalog = cachedAsync(
	async (req: Request, res: Response) => {
		const { campaign_id, catalog_id }: CatalogCampaignDto = req.body;

		if (!campaign_id || !catalog_id) {
			handleError(
				res,
				400,
				"Algunos campos son requeridos",
				"El ID de Campaña, el ID de Catálogo son requeridos"
			);
			return;
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(campaign_id)) {
			handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID de la Campaña es inválido"
			);
			return;
		}

		if (!notionIdRegex.test(catalog_id)) {
			handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID del Catálogo es inválido"
			);
			return;
		}

		const response = await addCatalogCampaign({
			campaign_id,
			catalog_id,
		});

		handleResponse(res, 201, response, "Catálogo Campaña creado con éxito");
	}
);

export const updateCampaignCatalog = cachedAsync(
	async (req: Request, res: Response) => {}
);

export const deleteCampaignCatalog = cachedAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const catalogCampaignId = id.trim();

		if (!catalogCampaignId) {
			handleError(
				res,
				400,
				"El ID es requerido",
				"El ID de Catálogo Campaña es requerido"
			);
			return;
		}
		const catalogCampaign = await removeCatalogCampaign(catalogCampaignId);

		handleResponse(
			res,
			204,
			catalogCampaign,
			"Catálogo Campaña eliminado con éxito"
		);
	}
);

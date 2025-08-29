import type { Request, Response } from "express";
import type { CampaignRequestDto } from "../domain/dto/index.ts";
import {
	addCampaign,
	editCampaign,
	getACampaign,
	getAllCampaign,
	removeCampaign,
} from "../services/index.ts";
import {
	cachedAsync,
	capitalizeFirstLetter,
	ClientError,
	formatCampaignName,
	handleError,
	handleResponse,
} from "../utils/index.ts";

export const getAllCampaigns = cachedAsync(
	async (req: Request, res: Response) => {
		const result = await getAllCampaign();

		handleResponse(res, 200, result, "Campañas recuperadas");
	}
);

export const getCampaignById = cachedAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const campaignId = id.trim();

		if (!campaignId) {
			throw handleError(
				res,
				400,
				"ID es requerido",
				"El ID de la campaña es requerido"
			);
		}
		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(campaignId)) {
			throw handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID es inválido"
			);
		}

		const campaign = await getACampaign(id);

		handleResponse(res, 200, campaign, "Campaña recuperada");
	}
);

export const createCampaign = cachedAsync(
	async (req: Request, res: Response) => {
		const { name, catalog_id, start_date, end_date }: CampaignRequestDto =
			req.body;
		const cleanName = name.trim();

		if (!cleanName || !start_date || !end_date) {
			handleError(
				res,
				400,
				"Algunos campos son requeridos",
				"El nombre, fecha de inicio y fecha de fin de la campaña son requeridos"
			);
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(catalog_id)) {
			throw handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID del Catálogo es inválido"
			);
		}

		const campaign = await addCampaign({
			name: capitalizeFirstLetter(cleanName),
			catalog_id,
			start_date,
			end_date,
		});

		handleResponse(res, 201, campaign, "Campaña creada con éxito");
	}
);

export const updateCampaign = cachedAsync(
	async (req: Request, res: Response) => {
		const {
			name,
			catalog_id,
			start_date,
			end_date,
			catalog_campaign_id,
		}: CampaignRequestDto = req.body;
		const id = req.params.id as string;

		const campaignId = id.trim();
		const cleanName = name.trim();

		if (
			!campaignId ||
			!catalog_id ||
			!cleanName ||
			!start_date ||
			!end_date ||
			!catalog_campaign_id
		) {
			throw new ClientError(
				"Algunos campos son requeridos",
				400,
				"ID, Nombre, ID de catálogo, fecha de inicio, fecha de fin son requeridos"
			);
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(campaignId)) {
			throw handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID es inválido"
			);
		}

		if (!notionIdRegex.test(catalog_id)) {
			throw handleError(
				res,
				400,
				"ID inválido",
				"El formato del ID del Catálogo es inválido"
			);
		}

		if (cleanName.length > 20) {
			throw new ClientError(
				"El Nombre de la campaña es demasiado largo",
				400,
				"El tamaño del nombre de la campaña no debería superar los 20 caracteres"
			);
		}

		const campaign = await editCampaign({
			id: campaignId,
			name: formatCampaignName(cleanName),
			catalog_id,
			start_date: start_date,
			end_date: end_date,
			catalog_campaign_id,
		});

		handleResponse(res, 200, campaign, "Campaña actualizada exitosamente");
	}
);

export const deleteCampaign = cachedAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const campaignId = id.trim();

		if (!campaignId) {
			throw new ClientError(
				"El ID es requerido",
				400,
				"El ID de la campaña es requerido"
			);
		}

		const campaign = await removeCampaign(campaignId);
		handleResponse(res, 204, campaign, "Campaña eliminada exitosamente");
	}
);

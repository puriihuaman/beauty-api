import type { ICampaignModel } from "../domain/model/index.ts";
import {
	campaignRequestValidator,
	type ICampaignRequest,
	type ICampaignResponse,
} from "../dto/index.ts";
import { NotionClientError } from "../errors/index.ts";
import type { ICampaignRepository } from "../repository/index.ts";
import {
	addCatalogCampaign,
	editCatalogCampaign,
} from "./catalogCampaignService.ts";
import { type ICatalogService } from "./catalogService.ts";

export const campaignService = (
	repository: ICampaignRepository,
	catalogService: ICatalogService
): ICampaignService => {
	return {
		getAllCampaigns: async (): Promise<ICampaignResponse[]> => {
			const campaigns = await repository.findAll();

			return campaigns.map((campaign) => mapToResponse(campaign));
		},

		getCampaignById: async (campaignId: string) => {
			const campaign = await repository.findById(campaignId);

			if (!campaign) {
				throw new NotionClientError(
					"Campaña no encontrada",
					404,
					"No se puedo encontrar la campaña con el ID proporcionado",
					"buscar campaña por ID"
				);
			}

			return mapToResponse(campaign);
		},

		createCampaign: async (
			request: ICampaignRequest
		): Promise<ICampaignResponse> => {
			const existingCampaign = await repository.findByName(request.name);

			if (existingCampaign && !existingCampaign.archived) {
				throw new NotionClientError(
					"Ya existe la campaña",
					409,
					"No puede existir mas de una campaña con el mismo nombre",
					"buscar campaña"
				);
			}

			const catalog = await catalogService.getCatalogById(request.catalog_id);

			const currentTime = new Date().toISOString();
			const campaign: ICampaignModel = {
				name: campaignRequestValidator(request).name,
				start_date: request.start_date,
				end_date: request.end_date,
				archived: false,
				created_at: currentTime,
				updated_at: currentTime,
			};

			const id = await repository.save(campaign);
			campaign.id = id;

			// Aquí usar el servicio de catalog campaign
			await addCatalogCampaign({
				campaign_id: id,
				catalog_id: catalog.id,
			});

			return mapToResponse(campaign);
		},

		updateCampaign: async (
			id: string,
			request: ICampaignRequest
		): Promise<ICampaignResponse> => {
			const currentCampaign = await repository.findById(id);

			if (!currentCampaign) {
				throw new NotionClientError(
					"Campaña no encontrada",
					404,
					"No se puedo encontrar la campaña con el ID proporcionado",
					"buscar campaña por ID"
				);
			}

			if (currentCampaign.archived) {
				throw new NotionClientError(
					"No se pudo actualizar",
					500,
					"No se puede actualizar una campaña archivada",
					"actualizar campaña"
				);
			}

			if (request.name && request.name !== currentCampaign.name) {
				const existing = await repository.findByName(request.name);

				if (existing && existing.id !== id && !existing.archived) {
					throw new NotionClientError(
						"Ya existe la campaña",
						409,
						"No puede existir mas de una campaña con el mismo nombre",
						"buscar campaña"
					);
				}
			}

			const catalog = await catalogService.getCatalogById(request.catalog_id);

			const campaignToUpdate: Partial<ICampaignModel> = {
				name: campaignRequestValidator(request).name,
				updated_at: new Date().toISOString(),
			};

			await repository.update(id, campaignToUpdate);

			// Aquí usar el servicio de catalog campaign
			await editCatalogCampaign({
				id: request.catalog_campaign_id as string,
				campaign_id: id,
				catalog_id: catalog.id,
			});

			return mapToResponse({ ...currentCampaign, ...campaignToUpdate });
		},

		deleteCampaign: async (campaignId: string) => {
			const campaign = await repository.findById(campaignId);

			if (!campaign) {
				throw new NotionClientError(
					"Campaña no encontrada",
					404,
					"No se puedo encontrar la campaña con el ID proporcionado",
					"buscar campaña por ID"
				);
			}

			await repository.delete(campaignId);
		},
	};
};

export interface ICampaignService {
	createCampaign: (request: ICampaignRequest) => Promise<ICampaignResponse>;
	getAllCampaigns: () => Promise<ICampaignResponse[]>;
	getCampaignById: (id: string) => Promise<ICampaignResponse>;
	updateCampaign: (
		id: string,
		request: ICampaignRequest
	) => Promise<ICampaignResponse>;
	deleteCampaign: (id: string) => Promise<void>;
}

const mapToResponse = (campaign: ICampaignModel): ICampaignResponse => {
	return {
		id: campaign.id as string,
		name: campaign.name,
		start_date: campaign.start_date,
		end_date: campaign.end_date,
		created_at: campaign.created_at,
		updated_at: campaign.updated_at,
		archived: campaign.archived,
	};
};

import {
	createCampaignCatalog,
	deleteCampaignCatalog,
	getAllCampaignCatalogs,
	getCampaignCatalogById,
	updateCampaignCatalog,
} from "@controllers/index.ts";
import { Router } from "express";

const campaignRouter = Router();

campaignRouter.get(`/`, getAllCampaignCatalogs);

campaignRouter.get(`/:id`, getCampaignCatalogById);

campaignRouter.post(`/create`, createCampaignCatalog);

campaignRouter.put(`/update/:id`, updateCampaignCatalog);

campaignRouter.delete(`/delete/:id`, deleteCampaignCatalog);

export { campaignRouter };

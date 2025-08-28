import {
	createCampaignCatalog,
	deleteCampaignCatalog,
	getAllCampaignCatalogs,
	getCampaignCatalogById,
	updateCampaignCatalog,
} from "../../controllers/index.ts";
import { Router } from "express";

const catalogCampaignRouter = Router();

catalogCampaignRouter.get(`/`, getAllCampaignCatalogs);

catalogCampaignRouter.get(`/:id`, getCampaignCatalogById);

catalogCampaignRouter.post(`/create`, createCampaignCatalog);

catalogCampaignRouter.put(`/update/:id`, updateCampaignCatalog);

catalogCampaignRouter.delete(`/delete/:id`, deleteCampaignCatalog);

export { catalogCampaignRouter };

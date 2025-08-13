const express = require("express");
const {
	deleteCampaignCatalog,
	updateCampaignCatalog,
	createCampaignCatalog,
	getCampaignCatalogById,
	getAllCampaignCatalogs,
} = require("../../controllers");

const catalogCampaignRouter = express.Router();

catalogCampaignRouter.get(`/`, getAllCampaignCatalogs);

catalogCampaignRouter.get(`/:id`, getCampaignCatalogById);

catalogCampaignRouter.post(`/create`, createCampaignCatalog);

catalogCampaignRouter.put(`/update/:id`, updateCampaignCatalog);

catalogCampaignRouter.delete(`/delete/:id`, deleteCampaignCatalog);

module.exports = catalogCampaignRouter;

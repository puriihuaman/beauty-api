const express = require("express");
const {
	deleteCampaign,
	updateCampaign,
	createCampaign,
	getCampaignById,
	getAllCampaigns,
} = require("../../controllers");

const campaignRouter = express.Router();

campaignRouter.get(`/`, getAllCampaigns);

campaignRouter.get(`/:id`, getCampaignById);

campaignRouter.post(`/create`, createCampaign);

campaignRouter.put(`/update/:id`, updateCampaign);

campaignRouter.delete(`/delete/:id`, deleteCampaign);

module.exports = campaignRouter;

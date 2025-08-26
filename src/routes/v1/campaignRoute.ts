import {
	createCampaign,
	deleteCampaign,
	getAllCampaigns,
	getCampaignById,
	updateCampaign,
} from "../../controllers/index.ts";
import { Router } from "express";

const campaignRouter = Router();

campaignRouter.get("/", getAllCampaigns);

campaignRouter.get("/:id", getCampaignById);

campaignRouter.post("/create", createCampaign);

campaignRouter.put("/update/:id", updateCampaign);

campaignRouter.delete("/delete/:id", deleteCampaign);

export { campaignRouter };

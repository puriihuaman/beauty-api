import { Router } from "express";
import type { ICampaignController } from "../../controllers/index.ts";

export const campaignRouter = (
	campaignController: ICampaignController
): Router => {
	const {
		getAllCampaigns,
		getCampaignById,
		createCampaign,
		updateCampaign,
		deleteCampaign,
	} = campaignController;

	const campaignRouter = Router();

	campaignRouter.get("/", getAllCampaigns);

	campaignRouter.get("/:id", getCampaignById);

	campaignRouter.post("/create", createCampaign);

	campaignRouter.put("/update/:id", updateCampaign);

	campaignRouter.delete("/delete/:id", deleteCampaign);

	return campaignRouter;
};

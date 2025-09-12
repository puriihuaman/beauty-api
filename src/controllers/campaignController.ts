import type { NextFunction, Request, Response } from "express";
import { campaignRequestValidator } from "../dto/index.ts";
import type { ICampaignService } from "../services/index.ts";
import { handleResponse } from "../utils/index.ts";

export const campaignController = (
	service: ICampaignService
): ICampaignController => {
	return {
		getAllCampaigns: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			try {
				const campaigns = await service.getAllCampaigns();

				handleResponse(res, 200, campaigns, "Campañas recuperadas");
			} catch (error) {
				next(error);
			}
		},

		getCampaignById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			try {
				const { id } = req.params;

				const campaign = await service.getCampaignById(id as string);

				handleResponse(res, 200, campaign, "Campaña recuperada");
			} catch (error) {
				next(error);
			}
		},

		createCampaign: async (req: Request, res: Response, next: NextFunction) => {
			try {
				const request = campaignRequestValidator(req.body);

				const campaign = await service.createCampaign(request);

				handleResponse(res, 201, campaign, "Campaña creada con éxito");
			} catch (error) {
				next(error);
			}
		},

		updateCampaign: async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params;
			const request = campaignRequestValidator(req.body);

			const campaign = await service.updateCampaign(id as string, request);

			handleResponse(res, 200, campaign, "Campaña actualizada exitosamente");
		},

		deleteCampaign: async (req: Request, res: Response, next: NextFunction) => {
			try {
				const { id } = req.params;

				const campaign = await service.deleteCampaign(id as string);
				handleResponse(res, 204, campaign, "Campaña eliminada exitosamente");
			} catch (error) {
				next(error);
			}
		},
	};
};

export interface ICampaignController {
	getAllCampaigns: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getCampaignById: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	createCampaign: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	updateCampaign: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	deleteCampaign: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
}

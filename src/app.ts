import { Client } from "@notionhq/client";
import type { Application, NextFunction, Request, Response } from "express";
import express, { json } from "express";
import { env } from "./config/environment.ts";
import { campaignController, catalogController } from "./controllers/index.ts";
import {
	handleError,
	type ClientError,
	type ServerError,
	type UnauthorizedError,
} from "./errors/index.ts";
import { corsMiddleware } from "./middleware/index.ts";
import {
	notionCampaignRepository,
	notionCatalogoRepository,
} from "./repository/index.ts";
import { campaignRouter } from "./routes/index.ts";
import { catalogRouter } from "./routes/index.ts";
import { campaignService } from "./services/index.ts";
import { catalogService } from "./services/index.ts";

export const createApp = (): Application => {
	const app = express();

	app.disable("x-powered-by");
	app.use(corsMiddleware);
	app.use(json());
	app.use(express.urlencoded({ extended: true }));

	const notionClient = new Client({ auth: env.NOTION_TOKEN });

	const catalogRepo = notionCatalogoRepository(
		notionClient,
		env.NOTION_CATALOG
	);
	const catalogServe = catalogService(catalogRepo);
	const catalogCtr = catalogController(catalogServe);

	const campaignRepo = notionCampaignRepository(
		notionClient,
		env.NOTION_CAMPAIGN
	);
	const campaignServe = campaignService(campaignRepo, catalogServe);
	const campaignCtr = campaignController(campaignServe);

	const CONTEXT_PATH = `/api/v1/webhook`;

	app.use(`${CONTEXT_PATH}/catalogs`, catalogRouter(catalogCtr));
	app.use(`${CONTEXT_PATH}/campaigns`, campaignRouter(campaignCtr));

	app.use(
		(
			error: UnauthorizedError | ClientError | ServerError,
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			handleError(res, error.statusCode, error.message, error.details);
		}
	);

	return app;
};

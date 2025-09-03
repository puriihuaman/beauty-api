import { Client } from "@notionhq/client";
import type { Application, NextFunction, Request, Response } from "express";
import express, { json } from "express";
import { env } from "./config/environment.ts";
import { catalogController } from "./controllers/index.ts";
import { corsMiddleware } from "./middleware/index.ts";
import { notionCatalogoRepository } from "./repository/notion/notionCatalogoRepository.ts";
import { catalogRouter } from "./routes/v1/index.ts";
import { catalogService } from "./services/index.ts";
import { ClientError, handleError, ServerError } from "./utils/index.ts";

export const createApp = (): Application => {
	const app = express();

	app.disable("x-powered-by");
	app.use(corsMiddleware);
	app.use(json());
	app.use(express.urlencoded({ extended: true }));

	const notionClient = new Client({ auth: env.NOTION_TOKEN });

	const repository = notionCatalogoRepository(notionClient, env.NOTION_CATALOG);

	const service = catalogService(repository);
	const controller = catalogController(service);

	const CONTEXT_PATH = `/api/v1/webhook`;

	const catalogRoutes = catalogRouter(controller);

	app.use(`${CONTEXT_PATH}/catalogs`, catalogRoutes);

	app.use(
		(
			error: ClientError | ServerError,
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			handleError(res, error.statusCode, error.message, error.details);
		}
	);

	return app;
};

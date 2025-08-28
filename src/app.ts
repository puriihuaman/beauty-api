import "./config/index.ts";

import type { NextFunction, Request, Response } from "express";
import express, { json } from "express";
import { corsMiddleware } from "./middleware/index.ts";
import {
	campaignRouter,
	catalogCampaignRouter,
	catalogRouter,
} from "./routes/v1/index.ts";
import { ClientError, handleError, ServerError } from "./utils/index.ts";

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

app.disable("x-powered-by");
app.use(corsMiddleware);
app.use(json());

const CONTEXT_PATH = `/api/v1/webhook`;

app.use(`${CONTEXT_PATH}/catalogs`, catalogRouter);
app.use(`${CONTEXT_PATH}/campaigns`, campaignRouter);
app.use(`${CONTEXT_PATH}/catalog-campaign`, catalogCampaignRouter);
// app.use(`${CONTEXT_PATH}/customers`, customerRouter);
// app.use(`${CONTEXT_PATH}/products`, productRouter);
// app.use(`${CONTEXT_PATH}/orders`, orderRouter);

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

app.listen(PORT, () => console.log(`Escuchando en ${HOSTNAME}:${PORT}`));

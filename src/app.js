require("dotenv").config();

const express = require("express");
const {
	catalogRouter,
	campaignRouter,
	catalogCampaignRouter,
	customerRouter,
	productRouter,
	orderRouter,
} = require("./routes/v1");
const { corsMiddleware } = require("./config");

const app = express();

const PORT = 3000;
const HOSTNAME = `localhost`;

app.disable("x-powered-by");
app.use(corsMiddleware);
app.use(express.json());

const CONTEXT_PATH = `/api/v1/webhook`;

app.use(`${CONTEXT_PATH}/catalogs`, catalogRouter);
app.use(`${CONTEXT_PATH}/campaigns`, campaignRouter);
app.use(`${CONTEXT_PATH}/catalog-campaign`, catalogCampaignRouter);
app.use(`${CONTEXT_PATH}/customers`, customerRouter);
app.use(`${CONTEXT_PATH}/products`, productRouter);
app.use(`${CONTEXT_PATH}/orders`, orderRouter);

app.listen(PORT, HOSTNAME, () => console.log(`Escuchando en ${HOSTNAME}`));

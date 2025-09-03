import dotenv from "dotenv";

dotenv.config();

export const env = {
	PORT: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || "development",
	NOTION_TOKEN: process.env.NOTION_TOKEN || "",
	NOTION_CATALOG: process.env.NOTION_CATALOG_DB_ID || "",
	NOTION_CAMPAIGN: process.env.NOTION_CAMPAIGN_DB_ID || "",
	NOTION_CATALOG_CAMPAIGN: process.env.NOTION_CATALOG_CAMPAIGN_DB_ID || "",
	NOTION_CLIENT: process.env.NOTION_CLIENT_DB_ID || "",
	NOTION_PRODUCT: process.env.NOTION_PRODUCT_DB_ID || "",
	NOTION_ORDER: process.env.NOTION_ORDER_DB_ID || "",
	NOTION_DETAIL: process.env.NOTION_DETAIL_DB_ID || "",

	CORS: {
		origin:
			process.env.NODE_ENV === "production"
				? process.env.CORS_ORIGIN?.split(",") || []
				: ["http://localhost:5173", "http://localhost:3000"],
		credentials: true,
	},
};

const required = [
	"NOTION_TOKEN",
	"NOTION_CATALOG",
	"NOTION_CAMPAIGN",
	"NOTION_CATALOG_CAMPAIGN",
	"NOTION_CLIENT",
	"NOTION_PRODUCT",
	"NOTION_ORDER",
	"NOTION_DETAIL",
];

const missing = required.filter((key) => !env[key as keyof typeof env]);
if (missing.length > 0) {
	throw new Error(`Variables faltantes: ${missing.join(", ")}`);
}

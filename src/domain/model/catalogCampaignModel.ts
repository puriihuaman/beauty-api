import type { CampaignModel } from "./campaignModel.ts";
import type { CatalogModel } from "./catalogModel.ts";

export interface CatalogCampaignModel {
	id: string;
	code: string;
	campaign_id: CampaignModel["id"];
	catalog_id: CatalogModel["id"];
	created_at: string;
	updated_at: string;
	archived: boolean;
}

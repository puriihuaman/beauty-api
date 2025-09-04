import type { ICampaignModel } from "./campaignModel.ts";
import type { ICatalogModel } from "./catalogModel.ts";

export interface CatalogCampaignModel {
	id: string;
	code: string;
	campaign_id: ICampaignModel["id"];
	catalog_id: ICatalogModel["id"];
	created_at: string;
	updated_at: string;
	archived: boolean;
}

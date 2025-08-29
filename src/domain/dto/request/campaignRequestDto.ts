export interface CampaignRequestDto {
	id?: string;
	name: string;
	catalog_id: string;
	start_date: string;
	end_date: string;
	catalog_campaign_id?: string;
}

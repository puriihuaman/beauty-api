import type { ICampaignModel } from "../../domain/model/index.ts";

export interface ICampaignRepository {
	findById(id: string): Promise<ICampaignModel | null>;
	findAll(includeArchived?: boolean): Promise<ICampaignModel[]>;
	save(campaign: ICampaignModel): Promise<string>;
	update(id: string, campaign: Partial<ICampaignModel>): Promise<void>;
	delete(id: string): Promise<void>;
	findByName(name: string): Promise<ICampaignModel | null>;
}

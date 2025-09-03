import {
	Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import type { CampaignRequestDto } from "../dto/index.ts";
import type { CampaignModel } from "../model/index.ts";
import { ClientError } from "../utils/index.ts";
import { getACatalog } from "./catalogService.ts";
import {
	addCatalogCampaign,
	editCatalogCampaign,
} from "./catalogCampaignService.ts";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });

const CAMPAIGN_PROPERTIES = {
	NAME: "NAME",
	START_DATE: "START_DATE",
	END_DATE: "END_DATE",
	CREATED_AT: "CREATED_AT",
	UPDATED_AT: "UPDATED_AT",
};

export const getAllCampaign = async () => {
	const { results } = await notion.databases.query({
		database_id: process.env.NOTION_CAMPAIGNS_DB_ID as string,
	});
	return mapperToList(results);
};

export const getACampaign = async (campaignId: string) => {
	const response = await notion.pages.retrieve({ page_id: campaignId });

	return mapperToObject(response);
};

export const addCampaign = async (campaign: CampaignRequestDto) => {
	const existing = await notion.databases.query({
		database_id: process.env.NOTION_CAMPAIGNS_DB_ID as string,
		filter: {
			property: CAMPAIGN_PROPERTIES.NAME,
			title: { equals: campaign.name },
		},
	});

	if (existing.results.length > 0) {
		throw new ClientError(
			"Ya existe una campaña",
			409,
			"No puede haber campañas duplicadas"
		);
	}

	const catalog = await getACatalog(campaign.catalog_id);

	const currentTime = new Date().toISOString();

	const response = await notion.pages.create({
		parent: { database_id: process.env.NOTION_CAMPAIGNS_DB_ID as string },
		properties: {
			[CAMPAIGN_PROPERTIES.NAME]: {
				title: [{ text: { content: campaign.name } }],
			},
			[CAMPAIGN_PROPERTIES.START_DATE]: {
				date: { start: campaign.start_date },
			},
			[CAMPAIGN_PROPERTIES.END_DATE]: { date: { start: campaign.end_date } },
			[CAMPAIGN_PROPERTIES.CREATED_AT]: { date: { start: currentTime } },
			[CAMPAIGN_PROPERTIES.UPDATED_AT]: { date: { start: currentTime } },
		},
	});

	await addCatalogCampaign({
		campaign_id: response.id,
		catalog_id: catalog.id,
	});

	return mapperToObject(response);
};

export const editCampaign = async (campaign: CampaignRequestDto) => {
	const currentCampaign = await notion.pages.retrieve({
		page_id: campaign.id as string,
	});

	if (!currentCampaign.id) {
		throw new ClientError(
			"Campaña no encontrada",
			404,
			`No existe la campaña con el ID: ${campaign.id}`
		);
	}

	const existing = await notion.databases.query({
		database_id: process.env.NOTION_CAMPAIGNS_DB_ID as string,
		filter: {
			property: CAMPAIGN_PROPERTIES.NAME,
			title: { equals: campaign.name },
		},
	});

	if (existing.results.length > 1) {
		throw new ClientError(
			"Ya existe una campaña con este nombre",
			409,
			"No puede haber campañas duplicadas"
		);
	}

	const catalog = await getACatalog(campaign.catalog_id);

	const currentTime = new Date().toISOString();
	const response = await notion.pages.update({
		page_id: campaign.id as string,
		properties: {
			[CAMPAIGN_PROPERTIES.NAME]: {
				title: [{ text: { content: campaign.name } }],
			},
			[CAMPAIGN_PROPERTIES.START_DATE]: {
				date: { start: campaign.start_date },
			},
			[CAMPAIGN_PROPERTIES.END_DATE]: { date: { start: campaign.end_date } },
			[CAMPAIGN_PROPERTIES.UPDATED_AT]: { date: { start: currentTime } },
		},
	});

	await editCatalogCampaign({
		id: campaign.catalog_campaign_id as string,
		campaign_id: response.id,
		catalog_id: catalog.id,
	});

	return mapperToObject(response);
};

export const removeCampaign = async (campaignId: string) => {
	const responseCurrent = await notion.pages.retrieve({ page_id: campaignId });

	if (!responseCurrent) {
		throw new ClientError(
			"Campaña no encontrada",
			404,
			`No existe la campaña con el ID: ${campaignId}`
		);
	}

	const response = await notion.pages.update({
		page_id: campaignId,
		archived: true,
		in_trash: true,
	});

	return mapperToObject(response);
};

const mapperToObject = (result: GetPageResponse): CampaignModel => {
	if (!("properties" in result)) {
		throw new Error("El objeto no contiene properties");
	}

	const properties = result.properties;
	const archived = result.archived;

	if (!properties.NAME || !("title" in properties.NAME)) {
		throw new Error(
			"El objeto properties.NAME es undefined o no contiene title"
		);
	}

	if (
		!properties.CREATED_AT ||
		!("created_time" in properties.CREATED_AT) ||
		!properties.UPDATED_AT ||
		!("last_edited_time" in properties.UPDATED_AT) ||
		!properties.START_DATE ||
		!("date" in properties.START_DATE) ||
		!properties.END_DATE ||
		!("date" in properties.END_DATE)
	) {
		throw new Error(
			"El objeto properties.CREATED_AT es undefined o no contiene la fecha"
		);
	}

	const { NAME, START_DATE, END_DATE, CREATED_AT, UPDATED_AT } = properties;

	const textContent =
		NAME.title.length >= 0 ? NAME.title[0]?.plain_text ?? "" : "";

	return {
		id: result.id,
		name: textContent,
		start_date: START_DATE.date?.start as string,
		end_date: END_DATE.date?.start as string,
		created_at: CREATED_AT.created_time,
		updated_at: UPDATED_AT.last_edited_time,
		archived,
	};
};

const mapperToList = (
	results: Array<
		| PartialPageObjectResponse
		| PageObjectResponse
		| PartialDatabaseObjectResponse
		| DatabaseObjectResponse
	>
): CampaignModel[] => {
	return results.map((result) => mapperToObject(result as GetPageResponse));
};

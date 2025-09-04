import {
	Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import type { CatalogCampaignDto } from "../dto/index.ts";
import { ClientError, ServerError } from "../errors/exception.ts";
import type { CatalogCampaignModel } from "../domain/model/catalogCampaignModel.ts";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });

const CATALOG_CAMPAIGN_PROPERTIES = {
	CODE: "CODE",
	CAMPAIGN: "CAMPAIGN",
	CATALOG: "CATALOG",
	CREATED_AT: "CREATED_AT",
	UPDATED_AT: "UPDATED_AT",
};

export const getAllCatalogCampaigns = async () => {
	const { results } = await notion.databases.query({
		database_id: process.env.NOTION_CATALOG_CAMPAIGN_DB_ID as string,
	});

	return mapperToList(results);
};

export const getCatalogCampaign = async (catalogCampaignId: string) => {
	const response = await notion.pages.retrieve({ page_id: catalogCampaignId });

	return mapperToCatalogCampaign(response);
};

export const addCatalogCampaign = async (
	catalogCampaign: CatalogCampaignDto
) => {
	// let currentCampaign = await notion.pages.retrieve({
	// 	page_id: catalogCampaign.campaign_id,
	// });

	// if (!currentCampaign?.id) {
	// 	throw new ClientError(
	// 		"Campaña no encontrada",
	// 		404,
	// 		`No existe la campaña con el ID: ${catalogCampaign.campaign_id}`
	// 	);
	// }

	// let currentCatalog = await notion.pages.retrieve({
	// 	page_id: catalogCampaign.catalog_id,
	// });

	// if (!currentCatalog?.id) {
	// 	throw new ClientError(
	// 		"Catálogo no encontrada",
	// 		404,
	// 		`No existe el catálogo con el ID: ${catalogCampaign.catalog_id}`
	// 	);
	// }

	const currentTime = new Date().toISOString();
	const uuid = crypto.randomUUID();
	const response = await notion.pages.create({
		parent: {
			database_id: process.env.NOTION_CATALOG_CAMPAIGN_DB_ID as string,
		},
		properties: {
			[CATALOG_CAMPAIGN_PROPERTIES.CODE]: {
				title: [{ text: { content: uuid } }],
			},
			[CATALOG_CAMPAIGN_PROPERTIES.CAMPAIGN]: {
				relation: [{ id: catalogCampaign.campaign_id }],
			},
			[CATALOG_CAMPAIGN_PROPERTIES.CATALOG]: {
				relation: [{ id: catalogCampaign.catalog_id }],
			},
			[CATALOG_CAMPAIGN_PROPERTIES.CREATED_AT]: {
				date: { start: currentTime },
			},
			[CATALOG_CAMPAIGN_PROPERTIES.UPDATED_AT]: {
				date: { start: currentTime },
			},
		},
	});

	return mapperToCatalogCampaign(response);
};

export const editCatalogCampaign = async (
	catalogCampaign: CatalogCampaignDto
) => {
	const currentCatalogCampaign = await notion.pages.retrieve({
		page_id: catalogCampaign.id as string,
	});

	if (!currentCatalogCampaign.id) {
		throw new ClientError(
			"Catálogo Campaña no encontrada",
			404,
			`No existe Catálogo Campaña con el ID: ${catalogCampaign.id}`
		);
	}

	const currentTime = new Date().toISOString();

	const response = await notion.pages.update({
		page_id: catalogCampaign.id as string,
		properties: {
			[CATALOG_CAMPAIGN_PROPERTIES.CAMPAIGN]: {
				relation: [{ id: catalogCampaign.campaign_id }],
			},
			[CATALOG_CAMPAIGN_PROPERTIES.CATALOG]: {
				relation: [{ id: catalogCampaign.catalog_id }],
			},
			[CATALOG_CAMPAIGN_PROPERTIES.UPDATED_AT]: {
				date: { start: currentTime },
			},
		},
	});

	return mapperToCatalogCampaign(response);
};

export const removeCatalogCampaign = async (catalogCampaignId: string) => {
	const responseCurrent = await notion.pages.retrieve({
		page_id: catalogCampaignId,
	});

	if (!responseCurrent) {
		throw new ClientError(
			"Catálogo Campaña no encontrado",
			404,
			`No existe el recurso con el ID: ${catalogCampaignId}`
		);
	}
	const response = await notion.pages.update({
		page_id: catalogCampaignId,
		archived: true,
		in_trash: true,
	});
	return mapperToCatalogCampaign(response);
};

const mapperToCatalogCampaign = (
	result: GetPageResponse
): CatalogCampaignModel => {
	if (!("properties" in result)) {
		throw new ServerError(
			"Propiedad no encontrada",
			500,
			"El objeto no contiene la propiedad 'properties'"
		);
	}

	const properties = result.properties;

	if (!properties.CODE || !("title" in properties.CODE)) {
		throw new ServerError(
			"Propiedad no encontrada",
			500,
			"El objeto 'properties' está indefinida o no contiene la propiedad 'título'"
		);
	}

	if (
		!properties.CREATED_AT ||
		!("created_time" in properties.CREATED_AT) ||
		!properties.UPDATED_AT ||
		!("last_edited_time" in properties.UPDATED_AT)
	) {
		throw new ServerError(
			"Propiedad no encontrada",
			500,
			"El objeto 'properties' está indefinida o no contiene la propiedad 'creado en' o 'actualizado en'"
		);
	}

	if (
		!properties.CAMPAIGN ||
		!("relation" in properties.CAMPAIGN) ||
		!properties.CATALOG ||
		!("relation" in properties.CATALOG)
	) {
		throw new ServerError(
			"Propiedad no encontrada",
			500,
			"El objeto 'properties' está indefinida o no contiene la propiedad 'campaña' o 'catálogo'"
		);
	}

	const { CODE, CAMPAIGN, CATALOG, CREATED_AT, UPDATED_AT } = properties;
	const archived = result.archived;

	const textContent =
		CODE.title.length >= 0 ? CODE.title[0]?.plain_text ?? "" : "";

	return {
		id: result.id,
		code: textContent,
		campaign_id: CAMPAIGN.relation[0]?.id as string,
		catalog_id: CATALOG.relation[0]?.id as string,
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
) => {
	return results.map((result) =>
		mapperToCatalogCampaign(result as GetPageResponse)
	);
};

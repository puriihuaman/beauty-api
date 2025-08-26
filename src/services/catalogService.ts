import {
	Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import type { CatalogModel } from "../domain/model/catalogModel.ts";
import type { CatalogRequestDto } from "../domain/dto/request/catalogRequestDto.ts";
import { ClientError } from "../utils/exception.ts";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });

const CATALOG_PROPERTIES = {
	NAME: "NAME",
	CREATED_AT: "CREATED_AT",
	UPDATED_AT: "UPDATED_AT",
};

export const getACatalog = async (catalogId: string) => {
	const response: GetPageResponse = await notion.pages.retrieve({
		page_id: catalogId,
	});

	return mapperToObject(response);
};

export const getAll = async () => {
	const { results } = await notion.databases.query({
		database_id: process.env.NOTION_CATALOGS_DB_ID as string,
	});

	return mapperToList(results);
};

export const addCatalog = async (catalog: CatalogRequestDto) => {
	const existing = await notion.databases.query({
		database_id: process.env.NOTION_CATALOGS_DB_ID as string,
		filter: {
			property: CATALOG_PROPERTIES.NAME,
			title: { equals: catalog.name },
		},
	});

	if (existing.results.length > 0) {
		throw new ClientError(
			"Ya existe un catálogo",
			409,
			"No puede haber catálogos duplicados"
		);
	}

	const currentTime = new Date().toISOString();

	const response = await notion.pages.create({
		parent: { database_id: process.env.NOTION_CATALOGS_DB_ID as string },
		properties: {
			[CATALOG_PROPERTIES.NAME]: {
				title: [{ text: { content: catalog.name } }],
			},
			[CATALOG_PROPERTIES.CREATED_AT]: { date: { start: currentTime } },
			[CATALOG_PROPERTIES.UPDATED_AT]: { date: { start: currentTime } },
		},
	});
	return mapperToObject(response);
};

export const editCatalog = async (catalog: CatalogRequestDto) => {
	const currentCatalog = await notion.pages.retrieve({
		page_id: catalog.id as string,
	});

	if (!currentCatalog.id) {
		throw new ClientError(
			"Catálogo no encontrado",
			404,
			`No existe el catálogo con el ID: ${catalog.id}`
		);
	}

	const existing = await notion.databases.query({
		database_id: process.env.NOTION_CATALOGS_DB_ID as string,
		filter: {
			property: CATALOG_PROPERTIES.NAME,
			title: { equals: catalog.name },
		},
	});

	if (existing.results.length > 0) {
		throw new ClientError(
			"Ya existe un catálogo con este nombre",
			409,
			"No puede haber catálogos duplicados"
		);
	}

	const currentTime = new Date().toISOString();

	const response = await notion.pages.update({
		page_id: catalog.id as string,
		properties: {
			[CATALOG_PROPERTIES.NAME]: {
				title: [
					{
						text: { content: catalog.name },
					},
				],
			},
			[CATALOG_PROPERTIES.UPDATED_AT]: { date: { start: currentTime } },
		},
	});

	return mapperToObject(response);
};

export const removeCatalog = async (catalogId: string) => {
	const responseCurrent: GetPageResponse = await notion.pages.retrieve({
		page_id: catalogId,
	});

	if (!responseCurrent) {
		throw new ClientError(
			"Catálogo no encontrado",
			404,
			`No existe el catálogo con el ID: ${catalogId}`
		);
	}

	const response = await notion.pages.update({
		page_id: catalogId,
		archived: true,
		in_trash: true,
	});

	return mapperToObject(response);
};

const mapperToObject = (result: GetPageResponse): CatalogModel => {
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
		!("last_edited_time" in properties.UPDATED_AT)
	) {
		throw new Error(
			"El objeto properties.CREATED_AT es undefined o no contiene la fecha"
		);
	}

	const { NAME, CREATED_AT, UPDATED_AT } = properties;

	const textContent =
		NAME.title.length >= 0 ? NAME.title[0]?.plain_text ?? "" : "";

	return {
		id: result.id,
		name: textContent,
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
): CatalogModel[] => {
	return results.map((result) => mapperToObject(result as GetPageResponse));
};

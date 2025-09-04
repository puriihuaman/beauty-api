import {
	APIErrorCode,
	type Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import { mapNotionError } from "../../errors/index.ts";
import type { ICampaignRepository } from "../index.ts";
import type { ICampaignModel } from "./../../domain/model/index.ts";

export const notionCampaignRepository = (
	notionClient: Client,
	databaseId: string
): ICampaignRepository => {
	return {
		findById: async (id: string): Promise<ICampaignModel | null> => {
			try {
				const response: GetPageResponse = await notionClient.pages.retrieve({
					page_id: id,
				});

				return mapFromNotionPage(response);
			} catch (error: any) {
				if (error.code === APIErrorCode.ValidationError) {
					throw mapNotionError(
						error,
						"El ID de la campaña es inválido o tiene el formato incorrecto"
					);
				}
				throw mapNotionError(error, "buscar campaña por ID");
			}
		},

		findAll: async (): Promise<ICampaignModel[]> => {
			try {
				const response = await notionClient.databases.query({
					database_id: databaseId,
				});

				return response.results.map((page) =>
					mapFromNotionPage(page as GetPageResponse)
				);
			} catch (error: any) {
				throw mapNotionError(error, "buscar campañas");
			}
		},

		save: async (campaign: ICampaignModel): Promise<string> => {
			try {
				const response = await notionClient.pages.create({
					parent: { database_id: databaseId },
					properties: {
						NAME: { title: [{ text: { content: campaign.name } }] },
						START_DATE: { date: { start: campaign.start_date } },
						END_DATE: { date: { start: campaign.end_date } },
						CREATED_AT: { date: { start: campaign.created_at } },
						UPDATED_AT: { date: { start: campaign.created_at } },
					},
				});

				return response.id;
			} catch (error) {
				throw mapNotionError(error, "guardar campaña");
			}
		},

		update: async (
			id: string,
			updates: Partial<ICampaignModel>
		): Promise<void> => {
			try {
				const properties: { [key: string]: any } = {};

				if (updates.name) {
					properties.NAME = { title: [{ text: { content: updates.name } }] };
				}

				if (updates.start_date) {
					properties.START_DATE = { date: { start: updates.start_date } };
				}

				if (updates.end_date) {
					properties.END_DATE = { date: { start: updates.end_date } };
				}

				if (updates.updated_at) {
					properties.UPDATED_AT = { date: { start: updates.updated_at } };
				}

				await notionClient.pages.update({
					page_id: id,
					properties,
				});
			} catch (error) {
				throw mapNotionError(error, "actualizar campaña");
			}
		},

		delete: async (id: string): Promise<void> => {
			try {
				await notionClient.pages.update({
					page_id: id,
					archived: true,
					in_trash: true,
				});
			} catch (error) {
				throw mapNotionError(error, "eliminar campaña");
			}
		},

		findByName: async (name: string): Promise<ICampaignModel | null> => {
			try {
				const response = await notionClient.databases.query({
					database_id: databaseId,
					filter: { property: "NAME", title: { equals: name } },
				});

				if (response.results.length === 0) {
					return null;
				}

				return mapFromNotionPage(response.results[0] as GetPageResponse);
			} catch (error: any) {
				throw mapNotionError(error, "buscar campaña");
			}
		},
	};
};

const mapFromNotionPage = (
	page:
		| GetPageResponse
		| Array<
				| PartialPageObjectResponse
				| PageObjectResponse
				| PartialDatabaseObjectResponse
				| DatabaseObjectResponse
		  >
): ICampaignModel => {
	if (!("properties" in page)) {
		throw new Error("El objeto no contiene properties");
	}

	const properties = page.properties;

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
		id: page.id,
		name: textContent,
		start_date: START_DATE.date?.start as string,
		end_date: END_DATE.date?.start as string,
		created_at: CREATED_AT.created_time,
		updated_at: UPDATED_AT.last_edited_time,
		archived: false,
	};
};

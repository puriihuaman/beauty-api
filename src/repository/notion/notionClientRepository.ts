import {
	APIErrorCode,
	type Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import type { IClientModel } from "../../domain/model/index.ts";
import type { IClientRequest } from "../../dto/index.ts";
import { mapNotionError } from "../../errors/index.ts";
import type { IClientRepository } from "../interface/clientRepository.ts";

const CLIENT_PROPERTIES = { NAME: "Name" };

export const notionClientRepository = (
	notionClient: Client,
	databaseId: string
): IClientRepository => {
	return {
		findById: async (id: IClientModel["id"]): Promise<IClientModel | null> => {
			try {
				const response = await notionClient.pages.retrieve({ page_id: id });

				return mapFromNotionPage(response);
			} catch (error: any) {
				if (error.code === APIErrorCode.ValidationError) {
					throw mapNotionError(
						error,
						"El ID del cliente es inválido o tiene el formato incorrecto"
					);
				}

				throw mapNotionError(error, "buscar cliente por ID");
			}
		},

		findAll: async (): Promise<IClientModel[]> => {
			try {
				const response = await notionClient.databases.query({
					database_id: databaseId,
				});

				return response.results.map((page) =>
					mapFromNotionPage(page as GetPageResponse)
				);
			} catch (error: any) {
				throw mapNotionError(error, "guardar clientes");
			}
		},

		findByName: async (
			name: IClientModel["name"]
		): Promise<IClientModel | null> => {
			try {
				const response = await notionClient.databases.query({
					database_id: databaseId,
					filter: {
						property: CLIENT_PROPERTIES.NAME,
						title: { equals: name },
					},
				});

				if (response.results.length === 0) return null;

				return mapFromNotionPage(response.results[0] as GetPageResponse);
			} catch (error: any) {
				throw mapNotionError(error, "buscar cliente");
			}
		},

		save: async (client: IClientRequest): Promise<IClientModel> => {
			try {
				const response = await notionClient.pages.create({
					parent: { database_id: databaseId },
					properties: {
						[CLIENT_PROPERTIES.NAME]: {
							title: [{ text: { content: client.name } }],
						},
					},
				});

				return mapFromNotionPage(response);
			} catch (error: any) {
				throw mapNotionError(error, "guardar cliente");
			}
		},

		update: async (
			id: IClientModel["id"],
			client: Partial<IClientRequest>
		): Promise<void> => {
			try {
				const properties: { [key: string]: any } = {};

				if (client.name) {
					properties[CLIENT_PROPERTIES.NAME] = {
						title: [{ text: { content: client.name } }],
					};
				}

				if (client.archived !== undefined) {
					properties.archived = { checkbox: client.archived };
				}

				await notionClient.pages.update({ page_id: id, properties });
			} catch (error) {
				throw mapNotionError(error, "actualizar cliente");
			}
		},

		delete: async (id: IClientModel["id"]): Promise<void> => {
			try {
				await notionClient.pages.update({
					page_id: id,
					archived: true,
					in_trash: true,
				});
			} catch (error) {
				throw mapNotionError(error, "eliminar cliente");
			}
		},

		count: async (includeArchived: boolean = false): Promise<number> => {
			try {
				const filter = includeArchived
					? undefined
					: {
							property: "archived",
							checkbox: { equals: false },
					  };

				const response = await notionClient.databases.query({
					database_id: databaseId,
				});

				return response.results.length;
			} catch (error: any) {
				throw new Error(`Error al contar los clientes`);
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
): IClientModel => {
	if (!("properties" in page)) {
		throw new Error("El objeto no contiene properties");
	}
	const properties = page.properties;

	if (!properties.Name || !("title" in properties.Name)) {
		throw new Error(
			"El objeto properties.NAME es undefined o no contiene title"
		);
	}

	if (
		!properties.Created_at ||
		!("created_time" in properties.Created_at) ||
		!properties.Updated_at ||
		!("last_edited_time" in properties.Updated_at)
	) {
		throw new Error(
			"El objeto properties.CREATED_AT es undefined o no contiene la fecha"
		);
	}

	const { Name, Created_at, Updated_at } = properties;

	const textContent =
		Name.title.length >= 0 ? Name.title[0]?.plain_text ?? "" : "";

	return {
		id: page.id,
		name: textContent,
		createdAt: Created_at?.created_time,
		updatedAt: Updated_at?.last_edited_time,
		archived: page.archived || false,
	};
};

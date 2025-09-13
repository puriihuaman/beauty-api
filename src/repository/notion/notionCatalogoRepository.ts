import {
	APIErrorCode,
	Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import type { ICatalogModel } from "../../domain/model/index.ts";
import type { ICatalogRepository } from "../interface/catalogRepository.ts";
import { mapNotionError } from "../../errors/mapNotionError.ts";
import type { ICatalogRequest } from "../../dto/index.ts";

const CATALOG_PROPERTIES = { NAME: "Name" };

export const notionCatalogoRepository = (
	notionClient: Client,
	databaseId: string
): ICatalogRepository => {
	return {
		findById: async (
			id: ICatalogModel["id"]
		): Promise<ICatalogModel | null> => {
			try {
				const response = await notionClient.pages.retrieve({ page_id: id });

				return mapFromNotionPage(response);
			} catch (error: any) {
				if (error.code === APIErrorCode.ValidationError) {
					throw mapNotionError(
						error,
						"El ID del catálogo es inválido o tiene el formato incorrecto"
					);
				}

				throw mapNotionError(error, "buscar catálogo por ID");
			}
		},

		findAll: async (
			includeArchived: boolean = false
		): Promise<ICatalogModel[]> => {
			try {
				const filter = includeArchived
					? undefined
					: {
							property: "archived",
							// checkbox: {
							// 	equals: false,
							// },
					  };

				const response = await notionClient.databases.query({
					database_id: databaseId,
					// filter,
					// sorts: [
					// 	{
					// 		property: "name",
					// 		direction: "ascending",
					// 	},
					// ],
				});

				return response.results.map((page) =>
					mapFromNotionPage(page as GetPageResponse)
				);
			} catch (error: any) {
				throw mapNotionError(error, "buscar catálogos");
			}
		},

		findByName: async (
			name: ICatalogModel["name"]
		): Promise<ICatalogModel | null> => {
			try {
				const response = await notionClient.databases.query({
					database_id: databaseId,
					filter: {
						property: CATALOG_PROPERTIES.NAME,
						title: { equals: name },
					},
				});

				if (response.results.length === 0) return null;

				return mapFromNotionPage(response.results[0] as GetPageResponse);
			} catch (error: any) {
				throw mapNotionError(error, "buscar catálogo por nombre");
			}
		},

		save: async (catalog: ICatalogRequest): Promise<ICatalogModel> => {
			try {
				const response = await notionClient.pages.create({
					parent: { database_id: databaseId },
					properties: {
						[CATALOG_PROPERTIES.NAME]: {
							title: [{ text: { content: catalog.name } }],
						},
					},
				});

				return mapFromNotionPage(response);
			} catch (error: any) {
				throw mapNotionError(error, "guardar catálogo");
			}
		},

		update: async (
			id: ICatalogModel["id"],
			client: Partial<ICatalogRequest>
		): Promise<void> => {
			try {
				const properties: { [key: string]: any } = {};

				if (client.name) {
					properties[CATALOG_PROPERTIES.NAME] = {
						title: [{ text: { content: client.name } }],
					};
				}

				if (client.archived !== undefined) {
					properties.archived = { checkbox: client.archived };
				}

				await notionClient.pages.update({
					page_id: id,
					properties,
				});
			} catch (error: any) {
				throw mapNotionError(error, "actualizar catálogo");
			}
		},

		delete: async (id: ICatalogModel["id"]): Promise<void> => {
			try {
				await notionClient.pages.update({
					page_id: id,
					archived: true,
					in_trash: true,
				});
			} catch (error: any) {
				throw mapNotionError(error, "eliminar catálogo");
			}
		},

		count: async (includeArchived: boolean = false): Promise<number> => {
			try {
				const filter = includeArchived
					? undefined
					: {
							property: "archived",
							checkbox: {
								equals: false,
							},
					  };

				const response = await notionClient.databases.query({
					database_id: databaseId,
					// filter,
				});

				return response.results.length;
			} catch (error: any) {
				throw mapNotionError(error, "contar catálogos");
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
): ICatalogModel => {
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

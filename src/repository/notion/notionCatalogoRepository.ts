import {
	Client,
	type DatabaseObjectResponse,
	type GetPageResponse,
	type PageObjectResponse,
	type PartialDatabaseObjectResponse,
	type PartialPageObjectResponse,
} from "@notionhq/client";
import type { ICatalogModel } from "../../domain/model/index.ts";
import type { ICatalogRepository } from "../interface/catalogRepository.ts";

export const notionCatalogoRepository = (
	notionClient: Client,
	databaseId: string
): ICatalogRepository => {
	return {
		findById: async (id: string): Promise<ICatalogModel | null> => {
			try {
				const response: GetPageResponse = await notionClient.pages.retrieve({
					page_id: id,
				});

				if (!("properties" in response)) {
					return null;
				}

				return mapFromNotionPage(response as any);
			} catch (error: any) {
				if (error.code === "object_not_found") {
					return null;
				}
				throw new Error(`Error al buscar catálogo por ID: ${error.message}`);
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
				throw new Error(`Error al obtener catálogos: ${error.message}`);
			}
		},

		findByName: async (name: string): Promise<ICatalogModel | null> => {
			try {
				const response = await notionClient.databases.query({
					database_id: databaseId,
					filter: {
						property: "name",
						title: {
							equals: name,
						},
					},
				});

				if (response.results.length === 0) {
					return null;
				}

				return mapFromNotionPage(response.results[0] as GetPageResponse);
			} catch (error: any) {
				throw new Error(
					`Error al buscar catálogo por nombre: ${error.message}`
				);
			}
		},

		save: async (catalogo: ICatalogModel): Promise<string> => {
			try {
				const response = await notionClient.pages.create({
					parent: {
						database_id: databaseId,
					},
					properties: {
						name: {
							title: [
								{
									text: {
										content: catalogo.name,
									},
								},
							],
						},
						created_at: {
							date: {
								start: catalogo.created_at,
							},
						},
						updated_at: {
							date: {
								start: catalogo.updated_at,
							},
						},
						archived: {
							checkbox: catalogo.archived,
						},
					},
				});

				return response.id;
			} catch (error: any) {
				throw new Error(`Error al guardar catálogo: ${error.message}`);
			}
		},

		update: async (
			id: string,
			updates: Partial<ICatalogModel>
		): Promise<void> => {
			try {
				const properties: any = {};

				if (updates.name) {
					properties.name = {
						title: [
							{
								text: {
									content: updates.name,
								},
							},
						],
					};
				}

				if (updates.updated_at) {
					properties.updated_at = {
						date: {
							start: updates.updated_at,
						},
					};
				}

				if (updates.archived !== undefined) {
					properties.archived = {
						checkbox: updates.archived,
					};
				}

				await notionClient.pages.update({
					page_id: id,
					properties,
				});
			} catch (error: any) {
				throw new Error(`Error al actualizar catálogo: ${error.message}`);
			}
		},

		delete: async (id: string): Promise<void> => {
			try {
				await notionClient.pages.update({
					page_id: id,
					archived: true,
				});
			} catch (error: any) {
				throw new Error(`Error al eliminar catálogo: ${error.message}`);
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
				throw new Error(`Error al contar catálogos: ${error.message}`);
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
		id: page.id,
		name: textContent,
		created_at: CREATED_AT.created_time,
		updated_at: UPDATED_AT.last_edited_time,
		archived: page.archived || false,
	};
};

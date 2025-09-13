import type { ICatalogModel } from "../domain/model/index.ts";
import {
	catalogRequestValidator,
	type ICatalogRequest,
	type ICatalogResponse,
} from "../dto/index.ts";
import { NotionClientError } from "../errors/index.ts";
import type { ICatalogRepository } from "../repository/index.ts";

export const catalogService = (
	repository: ICatalogRepository
): ICatalogService => {
	return {
		createCatalog: async (
			request: ICatalogRequest
		): Promise<ICatalogResponse> => {
			const existingCatalog = await repository.findByName(request.name);

			if (existingCatalog && !existingCatalog.archived) {
				throw new NotionClientError(
					"Ya existe el catálogo",
					409,
					"No puede existir más de un catalogo con el mismo nombre",
					"crear catálogo"
				);
			}

			const catalog: ICatalogRequest = {
				name: catalogRequestValidator(request.name).name,
				archived: false,
			};

			const createdCatalog = await repository.save(catalog);

			return mapToResponse(createdCatalog);
		},

		getAllCatalogs: async (
			includeArchived: boolean = false
		): Promise<ICatalogResponse[]> => {
			const catalogs = await repository.findAll(includeArchived);

			return catalogs.map((catalog) => mapToResponse(catalog));
		},

		getCatalogById: async (
			catalogId: ICatalogModel["id"]
		): Promise<ICatalogResponse> => {
			const catalog = await repository.findById(catalogId);

			if (!catalog) {
				throw new NotionClientError(
					"Catálogo no encontrado",
					404,
					"No se pudo encontrar el catálogo con el ID proporcionado",
					"buscar catálogo por ID"
				);
			}

			return mapToResponse(catalog);
		},

		updateCatalog: async (
			catalogId: ICatalogModel["id"],
			request: ICatalogRequest
		): Promise<ICatalogResponse> => {
			const catalog = await repository.findById(catalogId);

			if (!catalog) {
				throw new NotionClientError(
					"Catálogo no encontrado",
					404,
					"No se pudo encontrar el catálogo con el ID proporcionado",
					"buscar catálogo por ID"
				);
			}

			if (catalog.archived) {
				throw new NotionClientError(
					"No se pudo actualizar",
					500,
					"No se puede actualizar un catálogo archivado",
					"actualizar catálogo"
				);
			}

			if (request.name && request.name !== catalog.name) {
				const existingCatalog = await repository.findByName(request.name);

				if (
					existingCatalog &&
					existingCatalog.id !== catalogId &&
					!existingCatalog.archived
				) {
					throw new NotionClientError(
						"Ya existe un catálogo",
						409,
						"No puede existir más de un catálogo con el mismo nombre",
						"buscar catálogo"
					);
				}
			}

			const catalogToUpdate: ICatalogRequest = {
				name: catalogRequestValidator(request.name).name,
			};

			await repository.update(catalogId, { ...catalogToUpdate });

			return mapToResponse({ ...catalog, ...catalogToUpdate });
		},

		archiveCatalog: async (catalogId: string): Promise<void> => {
			const catalog = await repository.findById(catalogId);

			if (!catalog) {
				throw new NotionClientError(
					"Catálogo no encontrado",
					404,
					"No se pudo encontrar el catálogo con el ID proporcionado",
					"buscar catálogo por ID"
				);
			}

			if (catalog.archived) {
				throw new NotionClientError(
					"No se pudo archivar",
					500,
					"No se puede archivar un catálogo que ya está archivado",
					"archivar catálogo"
				);
			}

			await repository.update(catalogId, { archived: true });
		},

		restoreCatalog: async (catalogId: string): Promise<void> => {
			const catalog = await repository.findById(catalogId);
			if (!catalog) {
				throw new NotionClientError(
					"Catálogo no encontrado",
					404,
					"No se pudo encontrar el catálogo con el ID proporcionado",
					"buscar catálogo por ID"
				);
			}

			if (!catalog.archived) {
				throw new NotionClientError(
					"No se pudo restaurar",
					500,
					"No se puede restaurar un catálogo que no está archivado",
					"restaurar catálogo"
				);
			}

			await repository.update(catalogId, { archived: false });
		},

		deleteCatalog: async (catalogId: ICatalogModel["id"]): Promise<void> => {
			const catalog = await repository.findById(catalogId);

			if (!catalog) {
				throw new NotionClientError(
					"Catálogo no encontrado",
					404,
					"No se pudo encontrar el catálogo con el ID proporcionado",
					"buscar catálogo por ID"
				);
			}

			await repository.delete(catalogId);
		},

		getCatalogStats: async (): Promise<{
			total: number;
			active: number;
			archived: number;
		}> => {
			const [total, active] = await Promise.all([
				repository.count(true),
				repository.count(false),
			]);

			return {
				total,
				active,
				archived: total - active,
			};
		},
	};
};

export interface ICatalogService {
	createCatalog: (request: ICatalogRequest) => Promise<ICatalogResponse>;
	getAllCatalogs: (includeArchived?: boolean) => Promise<ICatalogResponse[]>;
	getCatalogById: (catalogId: ICatalogModel["id"]) => Promise<ICatalogResponse>;
	updateCatalog: (
		catalogId: ICatalogModel["id"],
		request: ICatalogRequest
	) => Promise<ICatalogResponse>;
	archiveCatalog: (catalogId: ICatalogModel["id"]) => Promise<void>;
	restoreCatalog: (catalogId: ICatalogModel["id"]) => Promise<void>;
	getCatalogStats: () => Promise<{
		total: number;
		active: number;
		archived: number;
	}>;
	deleteCatalog: (catalogId: ICatalogModel["id"]) => Promise<void>;
}

const mapToResponse = (catalog: ICatalogModel): ICatalogResponse => {
	return {
		id: catalog.id,
		name: catalog.name,
		createdAt: catalog.createdAt,
		updatedAt: catalog.updatedAt,
		archived: catalog.archived,
	};
};

import type { ICatalogModel } from "../domain/model/index.ts";
import {
	catalogRequestValidator,
	type ICatalogRequest,
	type ICatalogResponse,
} from "../dto/index.ts";
import type { ICatalogRepository } from "../repository/interface/catalogRepository.ts";

export const catalogService = (
	repository: ICatalogRepository
): ICatalogService => {
	return {
		createCatalog: async (
			request: ICatalogRequest
		): Promise<ICatalogResponse> => {
			const existingCatalog = await repository.findByName(request.name);
			if (existingCatalog && !existingCatalog.archived) {
				throw new Error("Ya existe un catálogo con ese nombre");
			}

			const currentTime = new Date().toISOString();
			const catalog: ICatalogModel = {
				name: catalogRequestValidator(request.name).name,
				created_at: currentTime,
				updated_at: currentTime,
				archived: false,
			};

			const id = await repository.save(catalog);
			catalog.id = id;

			return mapToResponse(catalog);
		},

		getAllCatalogs: async (
			includeArchived: boolean = false
		): Promise<ICatalogResponse[]> => {
			const catalogs = await repository.findAll(includeArchived);

			return catalogs.map((catalog) => mapToResponse(catalog));
		},

		getCatalogById: async (id: string): Promise<ICatalogResponse> => {
			const catalog = await repository.findById(id);
			if (!catalog) {
				throw new Error("Catálogo no encontrado");
			}
			return mapToResponse(catalog);
		},

		updateCatalog: async (
			id: string,
			request: ICatalogRequest
		): Promise<ICatalogResponse> => {
			const catalog = await repository.findById(id);

			if (!catalog) {
				throw new Error("Catálogo no encontrado");
			}

			if (catalog.archived) {
				throw new Error("No se puede actualizar un catálogo archivado");
			}

			// Validar que no exista otro catálogo con el mismo nombre
			if (request.name && request.name !== catalog.name) {
				const existingCatalog = await repository.findByName(request.name);

				if (
					existingCatalog &&
					existingCatalog.id !== id &&
					!existingCatalog.archived
				) {
					throw new Error("Ya existe un catálogo con ese nombre");
				}
			}

			const catalogToUpdate: Partial<ICatalogModel> = {
				name: catalogRequestValidator(request.name).name,
				updated_at: new Date().toISOString(),
			};

			await repository.update(id, { ...catalogToUpdate });

			return mapToResponse({ ...catalog, ...catalogToUpdate });
		},

		archiveCatalog: async (id: string): Promise<void> => {
			const catalog = await repository.findById(id);

			if (!catalog) {
				throw new Error("Catálogo no encontrado");
			}

			if (catalog.archived) {
				throw new Error("El catálogo ya está archivado");
			}

			await repository.update(id, {
				archived: true,
				updated_at: new Date().toISOString(),
			});
		},

		restoreCatalog: async (id: string): Promise<void> => {
			const catalog = await repository.findById(id);
			if (!catalog) {
				throw new Error("Catálogo no encontrado");
			}

			if (!catalog.archived) {
				throw new Error("El catálogo no está archivado");
			}

			await repository.update(id, {
				archived: false,
				updated_at: new Date().toISOString(),
			});
		},

		deleteCatalog: async (id: string): Promise<void> => {
			const catalog = await repository.findById(id);
			if (!catalog) {
				throw new Error("Catálogo no encontrado");
			}

			await repository.delete(id);
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
	getCatalogById: (id: string) => Promise<ICatalogResponse>;
	updateCatalog: (
		id: string,
		request: ICatalogRequest
	) => Promise<ICatalogResponse>;
	archiveCatalog: (id: string) => Promise<void>;
	restoreCatalog: (id: string) => Promise<void>;
	getCatalogStats: () => Promise<{
		total: number;
		active: number;
		archived: number;
	}>;
	deleteCatalog: (id: string) => Promise<void>;
}

const mapToResponse = (catalog: ICatalogModel): ICatalogResponse => {
	return {
		id: catalog.id as string,
		name: catalog.name,
		created_at: catalog.created_at,
		updated_at: catalog.updated_at,
		archived: catalog.archived,
	};
};

import type { NextFunction, Request, Response } from "express";
import { catalogRequestValidator } from "../dto/index.ts";
import type { ICatalogService } from "../services/index.ts";
import { handleResponse } from "../utils/index.ts";

export const catalogController = (
	service: ICatalogService
): ICatalogController => {
	return {
		createCatalog: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const request = catalogRequestValidator(req.body);
				const catalog = await service.createCatalog(request);

				res.status(201).json({
					success: true,
					data: catalog,
					message: "Catálogo creado exitosamente",
				});
			} catch (error) {
				next(error);
			}
		},

		getAllCatalogs: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const includeArchived = req.query.includeArchived === "true";
				const catalogs = await service.getAllCatalogs(includeArchived);

				handleResponse(res, 200, catalogs, "Catálogos recuperados");
			} catch (error) {
				next(error);
			}
		},

		getCatalogById: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				const catalog = await service.getCatalogById(id as string);

				handleResponse(res, 200, catalog, "Catálogo recuperado");
			} catch (error) {
				next(error);
			}
		},

		updateCatalog: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				const request = catalogRequestValidator(req.body);
				const catalog = await service.updateCatalog(id as string, request);

				handleResponse(res, 200, catalog, "Catálogo actualizado con éxito");
			} catch (error) {
				next(error);
			}
		},

		archiveCatalog: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				const catalog = await service.archiveCatalog(id as string);

				handleResponse(res, 200, catalog, "Catálogo archivado con éxito");
			} catch (error) {
				next(error);
			}
		},

		restoreCatalog: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				await service.restoreCatalog(id as string);

				handleResponse(res, 200, null, "Catálogo restaurado con éxito");
			} catch (error) {
				next(error);
			}
		},

		deleteCatalog: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				await service.deleteCatalog(id as string);

				handleResponse(res, 200, null, "Catálogo eliminado con éxito");
			} catch (error) {
				next(error);
			}
		},

		getCatalogStats: async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const stats = await service.getCatalogStats();

				handleResponse(res, 200, stats, "Catálogo archivado con éxito");
			} catch (error) {
				next(error);
			}
		},
	};
};

export interface ICatalogController {
	createCatalog: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getAllCatalogs: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getCatalogById: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	updateCatalog: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	archiveCatalog: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	restoreCatalog: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	deleteCatalog: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getCatalogStats: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
}

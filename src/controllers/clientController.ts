import type { NextFunction, Request, Response } from "express";
import { clientRequestValidator } from "../dto/index.ts";
import type { IClientService } from "../services/clientService.ts";
import { handleResponse } from "../utils/handleResponse.ts";

export const clientController = (
	service: IClientService
): IClientController => {
	return {
		getAllClients: async (req, res, next) => {
			try {
				const clients = await service.getAllClients();

				handleResponse(res, 200, clients, "Todos los clientes");
			} catch (error) {
				next(error);
			}
		},

		getClientById: async (req, res, next) => {
			try {
				const id = req.params.id as string;

				const client = await service.getClientById(id);

				handleResponse(res, 200, client, "Cliente recuperado");
			} catch (error) {
				next(error);
			}
		},

		createClient: async (req, res, next) => {
			try {
				const request = clientRequestValidator(req.body);

				const client = await service.createClient(request);

				handleResponse(res, 201, client, "Cliente creado exitosamente");
			} catch (error) {
				next(error);
			}
		},

		updateClient: async (req, res, next) => {
			try {
				const id = req.params.id as string;
				const request = clientRequestValidator(req.body);

				const client = await service.updateClient(id, request);

				handleResponse(res, 200, client, "Cliente actualizado exitosamente.");
			} catch (error) {
				next(error);
			}
		},

		archiveClient: async (req, res, next) => {
			try {
				const id = req.params.id as string;
				const client = await service.archiveClient(id);

				handleResponse(res, 200, client, "Cliente archivado con éxito");
			} catch (error) {
				next(error);
			}
		},

		restoreClient: async (req, res, next) => {
			try {
				const id = req.params.id as string;
				await service.restoreClient(id);

				handleResponse(res, 200, null, "Cliente restaurado con éxito");
			} catch (error) {
				next(error);
			}
		},

		deleteClient: async (req, res, next) => {
			try {
				const { id } = req.params;
				await service.deleteClient(id as string);

				handleResponse(res, 200, null, "Cliente eliminado exitosamente.");
			} catch (error) {
				next(error);
			}
		},

		getClientStats: async (req, res, next) => {
			try {
				const stats = await service.getClientStats();

				handleResponse(res, 200, stats, "Estadísticas de cliente");
			} catch (error) {
				next(error);
			}
		},
	};
};

export interface IClientController {
	createClient: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getAllClients: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getClientById: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	updateClient: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	archiveClient: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	restoreClient: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	deleteClient: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	getClientStats: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
}

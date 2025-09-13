import type { IClientModel } from "../domain/model/index.ts";
import {
	clientRequestValidator,
	type IClientRequest,
	type IClientResponse,
} from "../dto/index.ts";
import type { IClientRepository } from "../repository/index.ts";

export const clientService = (
	repository: IClientRepository
): IClientService => {
	return {
		createClient: async (request: IClientRequest): Promise<IClientResponse> => {
			const existingClient = await repository.findByName(request.name);
			if (existingClient && !existingClient.archived) {
				throw new Error("Ya existe un cliente con ese nombre");
			}

			const newClient: IClientRequest = {
				name: clientRequestValidator(request.name).name,
				archived: false,
			};

			const createdClient = await repository.save(newClient);

			return mapToResponse(createdClient);
		},

		getAllClients: async () => {
			const clients = await repository.findAll();

			return clients.map((client) => mapToResponse(client));
		},

		getClientById: async (id: IClientModel["id"]) => {
			const client = await repository.findById(id);
			if (!client) {
				throw new Error("Cliente no encontrado");
			}
			return mapToResponse(client);
		},

		updateClient: async (
			id: IClientModel["id"],
			request: IClientRequest
		): Promise<IClientResponse> => {
			const client = await repository.findById(id);

			if (!client) {
				throw new Error("Cliente no encontrado");
			}

			if (client.archived) {
				throw new Error("No se puede actualizar un cliente archivado");
			}

			if (request.name && request.name !== client.name) {
				const existingClient = await repository.findByName(request.name);

				if (
					existingClient &&
					existingClient.id !== id &&
					!existingClient.archived
				) {
					throw new Error("Ya existe un cliente con ese nombre");
				}
			}

			const clientToUpdate: IClientRequest = {
				name: clientRequestValidator(request.name).name,
			};

			await repository.update(id, { ...clientToUpdate });

			return mapToResponse({ ...client, ...clientToUpdate });
		},

		archiveClient: async (id: IClientModel["id"]) => {
			const client = await repository.findById(id);

			if (!client) {
				throw new Error("Catálogo no encontrado");
			}

			if (client.archived) {
				throw new Error("El catálogo ya está archivado");
			}

			await repository.update(id, { archived: true });
		},

		restoreClient: async (id: IClientModel["id"]) => {
			const client = await repository.findById(id);

			if (!client) {
				throw new Error("Cliente no encontrado");
			}

			if (!client.archived) {
				throw new Error("El cliente no está archivado");
			}

			await repository.update(id, { archived: false });
		},

		deleteClient: async (id: IClientModel["id"]): Promise<void> => {
			const client = await repository.findById(id as string);

			if (!client) {
				throw new Error("Cliente no encontrado");
			}

			await repository.delete(id);
		},

		getClientStats: async (): Promise<{
			total: number;
			active: number;
			archived: number;
		}> => {
			const [total, active] = await Promise.all([
				repository.count(true),
				repository.count(false),
			]);
			return { total, active, archived: total - active };
		},
	};
};

export interface IClientService {
	createClient: (request: IClientRequest) => Promise<IClientResponse>;
	getAllClients: (includeArchived?: boolean) => Promise<IClientResponse[]>;
	getClientById: (id: IClientModel["id"]) => Promise<IClientResponse>;
	updateClient: (
		id: IClientModel["id"],
		request: IClientRequest
	) => Promise<IClientResponse>;
	archiveClient: (id: IClientModel["id"]) => Promise<void>;
	restoreClient: (id: IClientModel["id"]) => Promise<void>;
	getClientStats: () => Promise<{
		total: number;
		active: number;
		archived: number;
	}>;
	deleteClient: (id: IClientModel["id"]) => Promise<void>;
}

const mapToResponse = (client: IClientModel): IClientResponse => {
	return {
		id: client.id,
		name: client.name,
		createdAt: client.createdAt,
		updatedAt: client.updatedAt,
		archived: client.archived,
	};
};

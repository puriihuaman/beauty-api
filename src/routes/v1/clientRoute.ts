import { Router } from "express";
import type { IClientController } from "../../controllers/index.ts";

export function clientRouter(clientController: IClientController): Router {
	const {
		getAllClients,
		getClientById,
		createClient,
		updateClient,
		deleteClient,
	} = clientController;

	const clientRouter = Router();

	clientRouter.route(`/`).get(getAllClients);
	clientRouter.route(`/:id`).get(getClientById);
	clientRouter.route(`/create`).post(createClient);
	clientRouter.route(`/update/:id`).put(updateClient);
	clientRouter.route(`/delete/:id`).delete(deleteClient);

	return clientRouter;
}

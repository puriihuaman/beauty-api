import {
	createCustomer,
	deleteCustomer,
	getAllCustomer,
	getCustomerById,
	updateCustomer,
} from "@controllers/index.ts";
import { Router } from "express";

const customerRouter = Router();

customerRouter.route(`/`).get(getAllCustomer);
customerRouter.route(`/:id`).get(getCustomerById);
customerRouter.route(`/create`).post(createCustomer);
customerRouter.route(`/update/:id`).put(updateCustomer);
customerRouter.route(`/delete/:id`).delete(deleteCustomer);

export { customerRouter };

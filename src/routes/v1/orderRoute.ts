import {
	createNewOrder,
	createOrder,
	deleteOrder,
	getAllOrders,
	getOrderById,
	updateOrder,
} from "@controllers/index.ts";
import { Router } from "express";

const orderRouter = Router();

orderRouter.get(`/`, getAllOrders);

orderRouter.get(`/:id`, getOrderById);

orderRouter.post(`/create`, createOrder);

orderRouter.post(`/new/:id`, createNewOrder);

orderRouter.put(`/update/:id`, updateOrder);

orderRouter.delete(`/delete/:id`, deleteOrder);

export { orderRouter };

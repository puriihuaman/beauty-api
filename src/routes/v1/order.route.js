const express = require("express");
const {
	getAllOrders,
	getOrderById,
	createOrder,
	createNewOrder,
	deleteOrder,
	updateOrder,
} = require("../../controllers");

const orderRouter = express.Router();

orderRouter.get(`/`, getAllOrders);

orderRouter.get(`/:id`, getOrderById);

orderRouter.post(`/create`, createOrder);

orderRouter.post(`/new/:id`, createNewOrder);

orderRouter.put(`/update/:id`, updateOrder);

orderRouter.delete(`/delete/:id`, deleteOrder);

module.exports = orderRouter;

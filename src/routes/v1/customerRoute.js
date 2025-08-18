const express = require("express");
const {
	getAllCustomer,
	getCustomerById,
	createCustomer,
	updateCustomer,
	deleteCustomer,
} = require("../../controllers");

const customerRouter = express.Router();

customerRouter.route(`/`).get(getAllCustomer);
customerRouter.route(`/:id`).get(getCustomerById);
customerRouter.route(`/create`).post(createCustomer);
customerRouter.route(`/update/:id`).put(updateCustomer);
customerRouter.route(`/delete/:id`).delete(deleteCustomer);

module.exports = customerRouter;

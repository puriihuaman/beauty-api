const express = require("express");
const {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
} = require("../../controllers");

const productRouter = express.Router();

productRouter.get(`/`, getAllProducts);

productRouter.get("/:id", getProductById);

productRouter.post(`/create`, createProduct);

productRouter.put(`/update/:id`, updateProduct);

productRouter.delete(`/delete/:id`, deleteProduct);

module.exports = productRouter;

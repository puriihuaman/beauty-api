import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getProductById,
	updateProduct,
} from "@controllers/index.ts";
import { Router } from "express";

const productRouter = Router();

productRouter.get(`/`, getAllProducts);

productRouter.get("/:id", getProductById);

productRouter.post(`/create`, createProduct);

productRouter.put(`/update/:id`, updateProduct);

productRouter.delete(`/delete/:id`, deleteProduct);

export { productRouter };

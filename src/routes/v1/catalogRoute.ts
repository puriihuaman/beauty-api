import { Router } from "express";
import {
	createCatalog,
	deleteCatalog,
	getAllCatalogs,
	getCatalogById,
	updateCatalog,
} from "../../controllers/index.ts";

const catalogRouter = Router();

catalogRouter.route("/").get(getAllCatalogs);

catalogRouter.get("/:id", getCatalogById);

catalogRouter.post("/create", createCatalog);

catalogRouter.put("/update/:id", updateCatalog);

catalogRouter.delete("/delete/:id", deleteCatalog);

export { catalogRouter };

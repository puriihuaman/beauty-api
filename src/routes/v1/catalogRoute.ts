import { Router } from "express";
import type { ICatalogController } from "../../controllers/index.ts";

export function catalogRouter(catalogController: ICatalogController): Router {
	const {
		getAllCatalogs,
		getCatalogById,
		createCatalog,
		updateCatalog,
		deleteCatalog,
	} = catalogController;

	const catalogRouter = Router();

	catalogRouter.get("/", getAllCatalogs);

	catalogRouter.get("/:id", getCatalogById);

	catalogRouter.post("/create", createCatalog);

	catalogRouter.put("/update/:id", updateCatalog);

	catalogRouter.delete("/delete/:id", deleteCatalog);

	return catalogRouter;
}

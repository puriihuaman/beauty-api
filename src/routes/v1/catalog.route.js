const express = require("express");

const {
	getAllCatalogs,
	getCatalogById,
	createCatalog,
	updateCatalog,
	deleteCatalog,
} = require("../../controllers");

const catalogRouter = express.Router();

catalogRouter.route(`/`).get(getAllCatalogs);

catalogRouter.get(`/:id`, getCatalogById);

catalogRouter.post(`/create`, createCatalog);

catalogRouter.put(`/update/:id`, updateCatalog);

catalogRouter.delete(`/delete/:id`, deleteCatalog);

module.exports = catalogRouter;

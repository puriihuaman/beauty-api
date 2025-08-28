import type { Request, Response } from "express";

const { Client } = require("@notionhq/client");
const { capitalizeFirstLetter } = require("../utils/capitalize-first-letter");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PRODUCT_PROPERTIES = {
	NAME: `NAME`,
	UNIT_PRICE: `UNIT_PRICE`,
	DESCRIPTION: `DESCRIPTION`,
	CATALOG_CAMPAIGN: `CATALOG_CAMPAIGN`,
	CREATED_AT: `CREATED_AT`,
	UPDATED_AT: `UPDATED_AT`,
};

const getAllProducts = async (req: Request, res: Response) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_PRODUCTS_DB_ID,
		});
		res.json({ message: `Todos los productos`, data: response.results });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getProductById = async (req: Request, res: Response) => {
	try {
		const id = req.params.id.trim();

		if (!id) {
			return res.status(400).json({
				error: "El ID del producto es requerido.",
			});
		}
		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(id)) {
			return res.status(400).json({ error: "El formato del ID es inválido." });
		}

		const response = await notion.pages.retrieve({
			page_id: id,
		});

		res.json({ message: "Producto recuperado exitosamente", data: response });
	} catch (error) {
		if (error.code === "unauthorized") {
			return res.status(401).json({
				error: "Token de la API de Notion no válido",
				details: error.message,
			});
		}

		if (error.code === "object_not_found") {
			return res.status(404).json({
				error: `No se encontró el producto con el ID: ${req.params.id}`,
			});
		}

		if (error.code === "notion_api_error") {
			return res
				.status(500)
				.json({ error: "Error en la API de Notion", details: error.message });
		}
		res
			.status(500)
			.json({ error: "Ocurrió un error inesperado en el servidor" });
	}
};

const createProduct = async (req: Request, res: Response) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res
				.status(400)
				.json({ error: "El cuerpo de la petición no puede estar vacío" });
		}
		const { name, price, description, idCatalogCampaign } = req.body;
		const cleanName = name.trim();
		const cleanDescription = description.trim();

		if (!cleanName) {
			return res.status(400).json({ error: "El nombre es requerido" });
		}

		if (!cleanDescription)
			return res.status(400).json({ error: "La descripción es requerida" });

		if (price <= 0) {
			return res
				.status(400)
				.json({ error: "El precio no puede ser cero o negativo" });
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
		if (!notionIdRegex.test(idCatalogCampaign)) {
			return res
				.status(400)
				.json({ error: "El formato del ID de la campaña es inválido." });
		}

		const currentTime = new Date().toISOString();

		const response = await notion.pages.create({
			parent: { database_id: process.env.NOTION_PRODUCTS_DB_ID },
			properties: {
				[PRODUCT_PROPERTIES.NAME]: {
					title: [
						{
							text: {
								content: capitalizeFirstLetter(cleanName),
							},
						},
					],
				},
				[PRODUCT_PROPERTIES.UNIT_PRICE]: { number: price },
				[PRODUCT_PROPERTIES.DESCRIPTION]: {
					rich_text: [{ text: { content: cleanDescription } }],
				},
				[PRODUCT_PROPERTIES.CATALOG_CAMPAIGN]: {
					relation: [{ id: idCatalogCampaign }],
				},
				[PRODUCT_PROPERTIES.CATALOG_CAMPAIGN]: {
					date: { start: currentTime },
				},
				[PRODUCT_PROPERTIES.UPDATED_AT]: {
					date: { start: currentTime },
				},
			},
		});

		res
			.status(201)
			.json({ message: "Producto agregado exitosamente", data: response });
	} catch (error) {
		if (error.code === `unauthorized`) {
			return res.status(401).json({
				error: `Token de la API de Notion no es válido.`,
				details: error.message,
			});
		}

		if (error.code === "notion_api_error") {
			return res
				.status(500)
				.json({ error: `Error en la API de Notion`, details: error.message });
		}
		res
			.status(500)
			.json({ error: "Ocurrió un error inesperado en el servidor." });
	}
};

const updateProduct = async (req: Request, res: Response) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res
				.status(400)
				.json({ error: "El cuerpo de la petición no puede estar vacío" });
		}
		const id = req.params.id.trim();
		const { name, price, description, idCatalogCampaign } = req.body;
		const cleanName = name.trim();
		const cleanDescription = description.trim();

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!id) {
			return res.status(400).json({ error: "El ID del producto es requerido" });
		}

		if (!notionIdRegex.test(id)) {
			return res.status(400).json({ error: "El formato del ID es inválido." });
		}

		try {
			await notion.pages.retrieve({ page_id: id });
		} catch (error) {
			return res.status(404).json({ error: "Producto no encontrado" });
		}

		if (!cleanName) {
			return res.status(400).json({ error: "El nombre es requerido" });
		}

		if (!cleanDescription)
			return res.status(400).json({ error: "La descripción es requerida" });

		if (!price || price <= 0) {
			return res.status(400).json({
				error: "El precio es requerido y no puede ser cero o negativo",
			});
		}

		if (!notionIdRegex.test(idCatalogCampaign)) {
			return res
				.status(400)
				.json({ error: "El formato del ID de la campaña es inválido." });
		}

		let currentCatalogCampaign;
		try {
			currentCatalogCampaign = await notion.pages.retrieve({
				page_id: idCatalogCampaign,
			});
		} catch (error) {
			res.status(404).json({ error: "Catálogo campaña no encontrado" });
		}

		const currentTime = new Date().toISOString();
		const properties = {};

		properties[PRODUCT_PROPERTIES.NAME] = {
			title: [{ text: { content: cleanName } }],
		};
		properties[PRODUCT_PROPERTIES.UNIT_PRICE] = { number: price };
		properties[PRODUCT_PROPERTIES.DESCRIPTION] = {
			rich_text: [{ text: { content: description } }],
		};
		properties[PRODUCT_PROPERTIES.CATALOG_CAMPAIGN] = {
			relation: [{ id: currentCatalogCampaign.id }],
		};
		properties[PRODUCT_PROPERTIES.UPDATED_AT] = {
			date: { start: currentTime },
		};

		if (Object.keys(properties).length === 1) {
			return res.status(400).json({ error: `No hay campos para actualizar.` });
		}

		const response = await notion.pages.update({
			page_id: id,
			properties,
		});
		res.json({ message: `Producto actualizado exitosamente`, data: response });
	} catch (error) {
		if (error.code === `unauthorized`) {
			return res.status(401).json({
				error: `Token de la API de Notion no es válido.`,
				details: error.message,
			});
		}

		if (error.code === "notion_api_error") {
			return res
				.status(500)
				.json({ error: `Error en la API de Notion`, details: error.message });
		}
		res
			.status(500)
			.json({ error: "Ocurrió un error inesperado en el servidor." });
	}
};

const deleteProduct = async (req: Request, res: Response) => {
	try {
		const productId = req.params.id.trim();

		if (!productId) {
			return res.status(400).json({ error: "El ID del producto es requerido" });
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(productId)) {
			return res.status(400).json({ error: "El formato del ID es inválido" });
		}

		const existingProduct = await notion.pages.retrieve({ page_id: productId });

		if (existingProduct) {
			return res.status(404).json({ error: "Producto no encontrado" });
		}

		await notion.pages.update({
			page_id: productId,
			archived: true,
			in_trash: true,
		});

		res.json({ message: "Producto eliminado exitosamente" });
	} catch (error) {
		if (error.code === "unauthorized") {
			return res.status(401).json({
				error: "Token de la API de Notion no es válido.",
			});
		}

		if (error.code === "notion_api_error") {
			return res.status(500).json({
				error: "Error en la API de Notion",
				details: error.message,
			});
		}

		res
			.status(500)
			.json({ error: "Ocurrió un error inesperado en el servidor." });
	}
};

export {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
};

import type { Request, Response } from "express";

const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const getAllCampaignCatalogs = async (req: Request, res: Response) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_CATALOG_CAMPAIGN_DB_ID,
		});

		res.json({
			message: `Todas la relaciones de catálogo y campañas`,
			data: response.results,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getCampaignCatalogById = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		if (!id || !id.trim()) {
			return res
				.status(400)
				.json({ error: `El ID de catálogo compaña es requerido` });
		}
		const response = await notion.pages.retrieve({ page_id: id });
		res.json({ message: `Catálogo compaña recuperada`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createCampaignCatalog = async (req: Request, res: Response) => {
	try {
		// id, fecha creación, fecha de actualización, id campaña, id catalogo
		const { id_campaign, id_catalog } = req.body;

		if (!id_campaign || !id_catalog) {
			return res.status(400).json({
				error: `El ID de la campaña y del catálogo son requeridos.`,
			});
		}

		let currentCampaign;
		try {
			currentCampaign = await notion.pages.retrieve({ page_id: id_campaign });
		} catch (error) {
			res.status(404).json({ error: `Campaña no encontrada.` });
		}

		let currentCatalog;
		try {
			currentCatalog = await notion.pages.retrieve({ page_id: id_catalog });
		} catch (error) {
			res.status(404).json({ error: `Catálogo no encontrado.` });
		}

		const now = new Date().toISOString();
		const uuid = crypto.randomUUID();
		const response = await notion.pages.create({
			parent: { database_id: process.env.NOTION_CATALOG_CAMPAIGN_DB_ID },
			properties: {
				ID: { title: [{ text: { content: uuid } }] },
				CAMPAIGN: { relation: [{ id: currentCampaign.id }] },
				CATALOG: { relation: [{ id: currentCatalog.id }] },
				CREATED_AT: { date: { start: now } },
				UPDATED_AT: { date: { start: now } },
			},
		});

		res.json({ message: `Catálogo campaña`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const updateCampaignCatalog = async (req: Request, res: Response) => {};

const deleteCampaignCatalog = async (req: Request, res: Response) => {
	try {
		const id = req.params.id.trim();
		if (!id) {
			return res.status(400).json({ error: `El ID es requerido.` });
		}
		const responseCurrent = await notion.pages.retrieve({ page_id: id });

		if (!responseCurrent) {
			return res.status(404).json({ error: `Catalogo campana no encontrado.` });
		}
		const response = await notion.pages.update({
			page_id: id,
			archived: true,
			in_trash: true,
		});
		res.json({
			message: `Catalogo campana eliminado exitosamente.`,
			data: response,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {
	getAllCampaignCatalogs,
	getCampaignCatalogById,
	createCampaignCatalog,
	updateCampaignCatalog,
	deleteCampaignCatalog,
};

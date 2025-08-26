import type { Request, Response } from "express";

const { Client } = require("@notionhq/client");
const { formatCampaignName } = require("../utils/format-campaign-name");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const getAllCampaigns = async (req: Request, res: Response) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_CAMPAIGNS_DB_ID,
		});
		res.json({ message: `Todas las campañas`, data: response.results });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getCampaignById = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		if (!id) {
			return res
				.status(400)
				.json({ error: `El ID de la campaña es requerido.` });
		}
		const response = await notion.pages.retrieve({ page_id: id });
		res.json({ message: `Campaña recuperada.`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createCampaign = async (req: Request, res: Response) => {
	try {
		const { name, startDate, endDate } = req.body;
		const cleanName = name.trim();

		if (!cleanName || !startDate || !endDate) {
			return res.status(400).json({
				error: `El nombre, fecha de inicio y fecha de fin de la campaña son requeridos.`,
			});
		}

		const existing = await notion.databases.query({
			database_id: process.env.NOTION_CAMPAIGNS_DB_ID,
			filter: {
				property: `NAME`,
				title: { equals: formatCampaignName(cleanName) },
			},
		});

		if (existing.results.length > 0) {
			return res.status(409).json({ error: `La campaña ya existe.` });
		}
		const now = new Date().toISOString();
		const response = await notion.pages.create({
			parent: { database_id: process.env.NOTION_CAMPAIGNS_DB_ID },
			properties: {
				NAME: { title: [{ text: { content: formatCampaignName(cleanName) } }] },
				START_DATE: { date: { start: startDate } },
				END_DATE: { date: { start: endDate } },
				CREATED_AT: { date: { start: now } },
				UPDATED_AT: { date: { start: now } },
			},
		});

		res.json({ message: `Campaña creada.`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const updateCampaign = async (req: Request, res: Response) => {
	try {
		const { name, startDate, endDate } = req.body;
		const id = req.params.id;
		const cleanName = name.trim();

		if (!cleanName || !startDate || !endDate) {
			return res.status(400).json({
				error: `Nombre, fecha de inicio, fecha de fin son requeridos.`,
			});
		}

		if (cleanName.length > 20) {
			return res
				.status(400)
				.json({ error: `El nombre de la campaña es demasiado largo.` });
		}
		let currentCampaign = null;
		try {
			currentCampaign = await notion.pages.retrieve({ page_id: id });
		} catch (error) {
			return res.status(404).json({ erro: `No existe la campaña.` });
		}

		const existing = await notion.databases.query({
			database_id: process.env.NOTION_CAMPAIGNS_DB_ID,
			filter: {
				property: `NAME`,
				title: { equals: cleanName },
			},
		});

		if (existing.results.length > 0) {
			return res
				.status(409)
				.json({ error: `Ya existe un catálogo con este nombre.` });
		}
		const now = new Date().toISOString();
		const response = await notion.pages.update({
			page_id: id,
			properties: {
				NAME: { title: [{ text: { content: formatCampaignName(cleanName) } }] },
				START_DATE: { date: { start: startDate } },
				END_DATE: { date: { start: endDate } },
				UPDATED_AT: { date: { start: now } },
			},
		});

		res.json({ message: `Campaña actualizada exitosamente.`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deleteCampaign = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (!id || !id.trim()) {
			return res
				.status(400)
				.json({ error: `El ID de la campaña es requerido.` });
		}
		const responseCurrent = await notion.pages.retrieve({ page_id: id });

		if (!responseCurrent)
			return res.status(404).json({ error: `No existe la campaña` });

		const response = await notion.pages.update({
			page_id: id,
			archived: true,
			in_trash: true,
		});

		res.json({ message: `Campaña eliminada exitosamente.`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getAllCampaigns,
	getCampaignById,
	createCampaign,
	updateCampaign,
	deleteCampaign,
};

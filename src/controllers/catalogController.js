const { Client } = require("@notionhq/client");
const { capitalizeFirstLetter } = require("../utils/capitalize-first-letter");
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const getAllCatalogs = async (req, res) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_CATALOGS_DB_ID,
		});

		res.json({ message: `Todos los catálogos`, data: response.results });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getCatalogById = async (req, res) => {
	try {
		const id = req.params.id;
		if (!id) {
			return res
				.status(400)
				.json({ error: `El ID del catálogo es requerido.` });
		}

		const response = await notion.pages.retrieve({ page_id: id });
		res.json({ message: `Catálogo recuperado`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createCatalog = async (req, res) => {
	try {
		const { name } = req.body;
		if (!name) {
			throw res.status(400).json({ error: `Nombre de catálogo es requerido.` });
		}

		const existing = await notion.databases.query({
			database_id: process.env.NOTION_CATALOGS_DB_ID,
			filter: {
				property: `NAME`,
				title: {
					equals: name,
				},
			},
		});

		if (existing.results.length > 0) {
			throw res.status(409).json({ error: `El catálogo ya existe.` });
		}

		const now = new Date().toISOString();

		const response = await notion.pages.create({
			parent: { database_id: process.env.NOTION_CATALOGS_DB_ID },
			properties: {
				NAME: { title: [{ text: { content: capitalizeFirstLetter(name) } }] },
				CREATED_AT: { date: { start: now } },
				UPDATED_AT: { date: { start: now } },
			},
		});
		res.json({ message: "Catálogo agregado a Notion", data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const updateCatalog = async (req, res) => {
	try {
		const { name } = req.body;
		const id = req.params.id;

		if (!name || !name.trim() || !id) {
			throw res
				.status(400)
				.json({ error: `ID y nombre de catálogo son requeridos.` });
		}

		if (name.trim().length > 50)
			throw res
				.status(400)
				.json({ error: `El nombre del catálogo es demasiado largo.` });

		let currentCatalog;
		try {
			currentCatalog = await notion.pages.retrieve({ page_id: id });
		} catch (error) {
			throw res.status(404).json({ error: `Catálogo no encontrado.` });
		}

		const existing = await notion.databases.query({
			database_id: process.env.NOTION_CATALOGS_DB_ID,
			filter: {
				property: `NAME`,
				title: { equals: name.trim() },
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
				NAME: { title: [{ text: { content: capitalizeFirstLetter(name) } }] },
				UPDATED_AT: { date: { start: now } },
			},
		});
		res.json({ message: "Producto actualizado en Notion", data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deleteCatalog = async (req, res) => {
	try {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: "El ID del catálogo requerido." });
		}

		const responseCurrent = await notion.pages.retrieve({ page_id: id });

		if (!responseCurrent)
			throw res.status(404).json({ error: `Catálogo no encontrado.` });

		const response = await notion.pages.update({
			page_id: id,
			archived: true,
			in_trash: true,
		});

		res.json({ message: `Catálogo eliminado.`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getAllCatalogs,
	getCatalogById,
	createCatalog,
	updateCatalog,
	deleteCatalog,
};

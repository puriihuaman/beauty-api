require("dotenv").config();

const { Client } = require("@notionhq/client");
const express = require("express");

const app = express();

const PORT = 3000;
const HOSTNAME = `localhost`;

app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const capitalizeFirstLetter = (text) => {
	const cleanText = text.trim();
	return cleanText.charAt(0).toUpperCase().concat(cleanText.slice(1));
};

const formatText = (text) => {
	return text.trim().replaceAll(/[^a-zA-Z0-9-]/g, "-");
};

// CATALOG
// ---------------------------------
app.get(`/webhook/catalogs`, async (req, res) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_CATALOGS_DB_ID,
		});

		res.json({ message: `Todos los catálogos`, data: response.results });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get(`/webhook/catalogs/:id`, async (req, res) => {
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
});

app.post(`/webhook/catalogs/create`, async (req, res) => {
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
});

app.put(`/webhook/catalogs/update/:id`, async (req, res) => {
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
});

app.delete(`/webhook/catalogs/delete/:id`, async (req, res) => {
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
});

// ---------------------------------

// CAMPAIGN
// ---------------------------------
app.get(`/webhook/campaigns`, async (req, res) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_CAMPAIGN_DB_ID,
		});
		res.json({ message: `Todas las campañas`, data: response.results });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get(`/webhook/campaigns/:id`, async (req, res) => {
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
});

app.post(`/webhook/campaigns/create`, async (req, res) => {
	try {
		const { name, startDate, endDate } = req.body;
		const cleanName = name.trim();

		if (!cleanName || !startDate || !endDate) {
			return res.status(400).json({
				error: `El nombre, fecha de inicio y fecha de fin de la campaña son requeridos.`,
			});
		}

		const existing = await notion.databases.query({
			database_id: process.env.NOTION_CAMPAIGN_DB_ID,
			filter: {
				property: `NAME`,
				title: { equals: formatText(cleanName) },
			},
		});

		if (existing.results.length > 0) {
			return res.status(409).json({ error: `La campaña ya existe.` });
		}
		const now = new Date().toISOString();
		const response = await notion.pages.create({
			parent: { database_id: process.env.NOTION_CAMPAIGN_DB_ID },
			properties: {
				NAME: { title: [{ text: { content: formatText(cleanName) } }] },
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
});

app.put(`/webhook/campaigns/update/:id`, async (req, res) => {
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
			database_id: process.env.NOTION_CAMPAIGN_DB_ID,
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
				NAME: { title: [{ text: { content: formatText(cleanName) } }] },
				START_DATE: { date: { start: startDate } },
				END_DATE: { date: { start: endDate } },
				UPDATED_AT: { date: { start: now } },
			},
		});

		res.json({ message: `Campaña actualizada exitosamente.`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.delete(`/webhook/campaigns/delete/:id`, async (req, res) => {
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
});

// ---------------------------------

app.get(`/webhook/products`, async (req, res) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.DB_ID_PRODUCTS,
		});
		res.json(response.results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get("/webhook/products/:id", async (req, res) => {
	try {
		const response = await notion.pages.retrieve({
			page_id: req.params.id,
		});
		res.json(response);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post(`/webhook/products/create`, async (req, res) => {
	const body = req.body;
	const { name, price, amount, description, catalog } = body;
	const now = new Date().toISOString();
	const subtotal = price * amount;

	await notion.pages.create({
		parent: { database_id: process.env.DB_ID_PRODUCTS },
		properties: {
			Name: { title: [{ text: { content: name } }] },
			Price: { number: price },
			Amount: { number: amount },
			Subtotal: { number: subtotal },
			Description: { rich_text: [{ text: { content: description } }] },
			Catalog: { select: { name: catalog } },
			Created_at: { date: { start: now } },
			Updated_at: { date: { start: now } },
		},
	});

	res.json({ message: `Producto agregado a Notion` });
});

app.put(`/webhook/products/update/:id`, async (req, res) => {
	try {
		const { name, price, amount, description, catalog } = req.body;
		const now = new Date().toISOString();
		const properties = {};
		let needSubtotalUpdate = false;
		if (name) properties.Name = { title: [{ text: { content: name } }] };
		if (price !== undefined) {
			properties.Price = { number: price };
			needSubtotalUpdate = true;
		}
		if (amount !== undefined) {
			properties.Amount = { number: amount };
			needSubtotalUpdate = true;
		}
		if (description)
			properties.Description = {
				rich_text: [{ text: { content: description } }],
			};
		if (catalog) properties.Catalog = { select: { name: catalog } };
		properties.Updated_at = { date: { start: now } };

		if (Object.keys(properties).length === 1) {
			return res.status(400).json({ error: "No hay campos para actualizar." });
		}

		let currentProduct = null;
		try {
			currentProduct = await notion.pages.retrieve({ page_id: req.params.id });
		} catch (err) {
			return res.status(404).json({ error: "Producto no encontrado." });
		}

		if (needSubtotalUpdate) {
			let currentPrice = price;
			let currentAmount = amount;

			if (currentPrice === undefined) {
				currentPrice = currentProduct.properties.Price.number;
			}
			if (currentAmount === undefined) {
				currentAmount = currentProduct.properties.Amount.number;
			}
			properties.Subtotal = { number: currentPrice * currentAmount };
		}

		const response = await notion.pages.update({
			page_id: req.params.id,
			properties,
		});
		res.json({ message: "Producto actualizado en Notion", data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// PEDIDOS
app.get(`/webhook/orders`, async (req, res) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.DB_ID_ORDERS,
		});
		res.json(response.results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get(`/webhook/orders/:id`, async (req, res) => {
	try {
		const response = await notion.pages.retrieve({ page_id: req.params.id });
		res.json(response);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post(`/webhook/orders/create`, async (req, res) => {
	try {
		const body = req.body;
		const { customer, products } = body;

		if (!customer || !Array.isArray(products) || products.length === 0) {
			return res
				.status(400)
				.json({ error: "Nombre de cliente y productos son obligatorios." });
		}

		const now = new Date().toISOString();
		const code = `${customer}-${now}`;

		let total = 0;
		const relations = [];

		for (const prod of products) {
			const subtotal = prod.price * prod.amount;
			const response = await notion.pages.create({
				parent: { database_id: process.env.DB_ID_PRODUCTS },
				properties: {
					Name: { title: [{ text: { content: prod.name } }] },
					Price: { number: prod.price },
					Amount: { number: prod.amount },
					Subtotal: { number: subtotal },
					Description: {
						rich_text: [{ text: { content: prod.description || "" } }],
					},
					Catalog: { select: { name: prod.catalog || "" } },
					Created_at: { date: { start: now } },
					Updated_at: { date: { start: now } },
				},
			});
			total += subtotal;
			relations.push({ id: response.id });
		}

		const response = await notion.pages.create({
			parent: {
				database_id: process.env.DB_ID_ORDERS,
			},
			properties: {
				Code: { title: [{ text: { content: code } }] },
				Customer: { rich_text: [{ text: { content: customer } }] },
				Status: { status: { name: "Pendiente" } },
				Total: { number: total },
				Product: { relation: relations },
				Created_at: { date: { start: now } },
				Updated_at: { date: { start: now } },
			},
		});

		res.json({ message: "Agregado a Notion", data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}

	// Si falla la creación del pedido o de algún producto:
	// Guarda los IDs de los productos creados. -> relations
	// Si falla la creación del pedido, recorre esos IDs y archívalos con notion.pages.update({ page_id, archived: true }).
});

app.post(`/webhook/orders/new/:id`, async (req, res) => {
	try {
		const id = req.params.id;
		const { products } = req.body;

		if (products.length === 0) {
			return res
				.status(400)
				.json({ error: "ID del pedido y productos son obligatorios." });
		}

		const order = await notion.pages.retrieve({ page_id: id });

		const now = new Date().toISOString();

		let total = 0;
		const relations = [];

		for (const prod of products) {
			const subtotal = prod.price * prod.amount;
			const response = await notion.pages.create({
				parent: { database_id: process.env.DB_ID_PRODUCTS },
				properties: {
					Name: { title: [{ text: { content: prod.name } }] },
					Price: { number: prod.price },
					Amount: { number: prod.amount },
					Subtotal: { number: subtotal },
					Description: {
						rich_text: [{ text: { content: prod.description || "" } }],
					},
					Catalog: { select: { name: prod.catalog || "" } },
					Created_at: { date: { start: now } },
					Updated_at: { date: { start: now } },
				},
			});
			total += subtotal;
			relations.push({ id: response.id });
		}

		const properties = {};
		properties.Product = {
			relation: [...order.properties.Product.relation, ...relations],
		};
		properties.Total = { number: order.properties.Total.number + total };
		properties.Updated_at = { date: { start: now } };

		const response = await notion.pages.update({
			page_id: id,
			properties,
		});

		res.json({ message: "Agregando mas productos a Notion", data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.delete(`/webhook/orders/delete/:id`, async (req, res) => {});

app.listen(PORT, HOSTNAME, () => console.log(`Escuchando en /webhook`));

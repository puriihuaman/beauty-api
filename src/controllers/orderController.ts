import type { Request, Response } from "express";

const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const getAllOrders = async (req: Request, res: Response) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.DB_ID_ORDERS,
		});
		res.json(response.results);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: errorMessage });
	}
};

const getOrderById = async (req: Request, res: Response) => {
	try {
		const response = await notion.pages.retrieve({ page_id: req.params.id });
		res.json(response);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: errorMessage });
	}
};

const createOrder = async (req: Request, res: Response) => {
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: errorMessage });
	}

	// Si falla la creación del pedido o de algún producto:
	// Guarda los IDs de los productos creados. -> relations
	// Si falla la creación del pedido, recorre esos IDs y archívalos con notion.pages.update({ page_id, archived: true }).
};

const createNewOrder = async (req: Request, res: Response) => {
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
		// properties.Product = {
		// 	relation: [...order.properties.Product.relation, ...relations],
		// };
		// properties.Total = { number: order.properties.Total.number + total };
		// properties.Updated_at = { date: { start: now } };

		const response = await notion.pages.update({
			page_id: id,
			properties,
		});

		res.json({ message: "Agregando mas productos a Notion", data: response });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: errorMessage });
	}
};

const updateOrder = async (req: Request, res: Response) => {};

const deleteOrder = async (req: Request, res: Response) => {};

export {
	getAllOrders,
	getOrderById,
	createOrder,
	createNewOrder,
	updateOrder,
	deleteOrder,
};

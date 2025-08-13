const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const getAllProducts = async (req, res) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.DB_ID_PRODUCTS,
		});
		res.json(response.results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getProductById = async (req, res) => {
	try {
		const response = await notion.pages.retrieve({
			page_id: req.params.id,
		});
		res.json(response);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createProduct = async (req, res) => {
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
};

const updateProduct = async (req, res) => {
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
			return res.status(400).json({ error: `No hay campos para actualizar.` });
		}

		let currentProduct = null;
		try {
			currentProduct = await notion.pages.retrieve({ page_id: req.params.id });
		} catch (err) {
			return res.status(404).json({ error: `Producto no encontrado.` });
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
		res.json({ message: `Producto actualizado en Notion`, data: response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deleteProduct = async (req, res) => {};

module.exports = {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
};

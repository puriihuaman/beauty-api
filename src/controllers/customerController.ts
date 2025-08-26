import { Client } from "@notionhq/client";
import type { Request, Response } from "express";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter.ts";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });

const NOTION_PROPERTIES = {
	NAME: `NAME`,
	CREATED_AT: `CREATED_AT`,
	UPDATED_AT: `UPDATED_AT`,
};

const getAllCustomer = async (req: Request, res: Response) => {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_CUSTOMER_DB_ID as string,
		});
		res.json({ message: `Todos los clientes`, data: response.results });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getCustomerById = async (req: Request, res: Response) => {
	try {
		const id = req.params.id.trim();
		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!id) {
			return res.status(400).json({ error: `El ID del cliente es requerido.` });
		}

		if (!notionIdRegex.test(id)) {
			return res.status(400).json({ error: `El formato del ID es inválido.` });
		}
		const response = await notion.pages.retrieve({
			page_id: id,
		});

		res.json({ message: `Cliente recuperado.`, data: response });
	} catch (error) {
		if (error.code === `unauthorized`) {
			return res.status(401).json({
				error: `Token de la API de Notion no válido.`,
				details: error.message,
			});
		}

		if (error.code === `object_not_found`) {
			return res.status(404).json({
				error: `No se encontró el cliente con el ID: ${req.params.id}`,
			});
		}

		if (error.code === `notion_api_error`) {
			return res
				.status(500)
				.json({ error: `Error en la API de Notion`, details: error.message });
		}

		res
			.status(500)
			.json({ error: `Ocurrió un error inesperado en el servidor.` });
	}
};

const createCustomer = async (req: Request, res: Response) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res
				.status(400)
				.json({ error: `El cuerpo de la petición no puede estar vacío.` });
		}

		const { name } = req.body;
		const cleanName = name.trim();

		if (!cleanName) {
			return res.status(400).json({ error: `El nombre es requerido.` });
		}

		if (cleanName.length > 80)
			return res
				.status(400)
				.json({ error: `El nombre del cliente es demasiado largo.` });

		const existingCustomer = await notion.databases.query({
			database_id: process.env.NOTION_CUSTOMER_DB_ID as string,
			filter: {
				property: NOTION_PROPERTIES.NAME,
				title: { equals: cleanName },
			},
		});

		if (existingCustomer.results.length > 0) {
			return res.status(409).json({ error: `El cliente ya existe.` });
		}
		const currentTime = new Date().toISOString();
		const response = await notion.pages.create({
			parent: { database_id: process.env.NOTION_CUSTOMER_DB_ID as string },
			properties: {
				[NOTION_PROPERTIES.NAME]: {
					title: [{ text: { content: capitalizeFirstLetter(cleanName) } }],
				},
				[NOTION_PROPERTIES.CREATED_AT]: { date: { start: currentTime } },
				[NOTION_PROPERTIES.UPDATED_AT]: { date: { start: currentTime } },
			},
		});

		res
			.status(201)
			.json({ message: `Cliente creado exitosamente.`, data: response });
	} catch (error) {
		if (error.code === `unauthorized`) {
			return res.status(401).json({
				error: `Token de la API de Notion no es válido.`,
				details: error.message,
			});
		}

		if (error.code === `notion_api_error`) {
			return res
				.status(500)
				.json({ error: `Error en la API de Notion`, details: error.message });
		}

		res
			.status(500)
			.json({ error: `Ocurrió un error inesperado en el servidor.` });
	}
};

const updateCustomer = async (req: Request, res: Response) => {
	try {
		const { name } = req.body;
		const id = req.params.id;

		const cleanName = name.trim();
		const cleanId = id.trim();

		if (!cleanName || !cleanId) {
			return res
				.status(400)
				.json({ error: `ID y nombre del cliente son requeridos.` });
		}
		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(cleanId)) {
			return res.status(400).json({ error: `El formato del ID es inválido.` });
		}

		try {
			await notion.pages.retrieve({ page_id: cleanId });
		} catch (error) {
			return res.status(404).json({ error: `Cliente no encontrado.` });
		}

		const existing = await notion.databases.query({
			database_id: process.env.NOTION_CUSTOMER_DB_ID,
			filter: {
				property: NOTION_PROPERTIES.NAME,
				title: { equals: cleanName },
			},
		});

		if (existing.results.length > 0) {
			return res
				.status(409)
				.json({ error: `Ya existe un cliente con este nombre.` });
		}

		if (cleanName.length > 80)
			return res
				.status(400)
				.json({ error: `El nombre del cliente es demasiado largo.` });

		const currentTime = new Date().toISOString();
		const response = await notion.pages.update({
			page_id: cleanId,
			properties: {
				[NOTION_PROPERTIES.NAME]: {
					title: [{ text: { content: capitalizeFirstLetter(cleanName) } }],
				},
				[NOTION_PROPERTIES.UPDATED_AT]: { date: { start: currentTime } },
			},
		});
		res.json({ message: `Cliente actualizado exitosamente.`, data: response });
	} catch (error) {
		if (error.code === `unauthorized`) {
			return res.status(401).json({
				error: `Token de la API de Notion no es válido.`,
			});
		}

		if (error.code === `notion_api_error`) {
			return res.status(500).json({
				error: `Error en la API de Notion`,
				details: error.message,
			});
		}

		res
			.status(500)
			.json({ error: `Ocurrió un error inesperado en el servidor.` });
	}
};

const deleteCustomer = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const cleanId = id.trim();

		if (!cleanId) {
			return res.status(400).json({ error: `El ID del cliente es requerido.` });
		}

		const notionIdRegex =
			/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

		if (!notionIdRegex.test(cleanId)) {
			return res.status(400).json({ error: `El formato del ID es inválido.` });
		}

		const existingCustomer = await notion.pages.retrieve({ page_id: cleanId });

		if (!existingCustomer) {
			return res.status(404).json({ error: `Cliente no encontrado.` });
		}

		await notion.pages.update({
			page_id: cleanId,
			archived: true,
			in_trash: true,
		});
		res.json({ message: `Cliente eliminado exitosamente.` });
	} catch (error) {
		if (error.code === `unauthorized`) {
			return res.status(401).json({
				error: `Token de la API de Notion no es válido.`,
			});
		}

		if (error.code === `notion_api_error`) {
			return res.status(500).json({
				error: `Error en la API de Notion`,
				details: error.message,
			});
		}

		res
			.status(500)
			.json({ error: `Ocurrió un error inesperado en el servidor.` });
	}
};

export {
	createCustomer,
	deleteCustomer,
	getAllCustomer,
	getCustomerById,
	updateCustomer,
};

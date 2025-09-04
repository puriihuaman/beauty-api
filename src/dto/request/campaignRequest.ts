import { ClientError } from "../../errors/index.ts";

export interface ICampaignRequest {
	id?: string;
	name: string;
	catalog_id: string;
	start_date: string;
	end_date: string;
	catalog_campaign_id?: string;
}

export const campaignRequestValidator = (
	request: ICampaignRequest | any
): ICampaignRequest => {
	const { name, start_date, end_date }: ICampaignRequest = request;

	if (!name && typeof name !== "string") {
		throw new ClientError(
			"El nombre es requerido",
			400,
			"El nombre de la campaña es requerido y debe ser un texto"
		);
	}

	if (!start_date) {
		throw new ClientError(
			"Fecha de inicio requerida",
			400,
			"La fecha de inicio de la campaña es obligatoria"
		);
	}

	if (new Date(start_date) <= new Date(new Date().setHours(0, 0, 0, 0))) {
		throw new ClientError(
			"Fecha de inicio inválida",
			400,
			"La fecha de inicio no puede ser anterior a hoy"
		);
	}

	if (new Date(start_date) >= new Date(end_date)) {
		throw new ClientError(
			"Fecha de inicio inválida",
			400,
			"La fecha de inicio no puede ser posterior o igual a la fecha de fin"
		);
	}

	if (!end_date) {
		throw new ClientError(
			"Fecha de fin requerida",
			400,
			"La fecha de fin de la campaña es obligatoria"
		);
	}

	if (new Date(end_date) <= new Date(new Date().setHours(0, 0, 0, 0))) {
		throw new ClientError(
			"Fecha de fin inválida",
			400,
			"La fecha de fin no puede ser anterior a hoy"
		);
	}

	if (new Date(end_date) <= new Date(start_date)) {
		throw new ClientError(
			"Fecha de fin inválida",
			400,
			"La fecha de fin no puede ser anterior igual a la fecha de inicio"
		);
	}

	const cleanName = name.trim();

	if (cleanName.length === 0) {
		throw new ClientError(
			"El nombre no puede ser un espacio",
			400,
			"El nombre de la campaña debe ser un texto"
		);
	}

	if (cleanName.length > 20) {
		throw new ClientError(
			"El nombre es demasiado largo",
			400,
			"El nombre no debe exceder los 20 caracteres"
		);
	}

	return { ...request, name: cleanName };
};

import { APIErrorCode, ClientErrorCode } from "@notionhq/client";
import { ClientError, ServerError, UnauthorizedError } from "./exception.ts";
import { NotionClientError } from "./notionClientError.ts";
import { NotionServerError } from "./notionServerError.ts";
import { NotionUnauthorizedError } from "./notionUnauthorizedError.ts";

export const mapNotionError = (
	error: any,
	context: string = "operación"
): ClientError | ServerError | UnauthorizedError => {
	const details = context || "Error desconocido";

	switch (error.code) {
		case APIErrorCode.ObjectNotFound:
			return new NotionClientError(
				`${context} no encontrado`,
				404,
				details,
				error.code
			);

		case APIErrorCode.Unauthorized:
			return new NotionUnauthorizedError(
				"Token de Notion inválido",
				401,
				details,
				error.code
			);

		case APIErrorCode.ValidationError:
			return new NotionClientError("Datos inválidos", 400, details, error.code);

		case APIErrorCode.InvalidRequest:
		case APIErrorCode.InvalidJSON:
			return new NotionClientError("Datos inválidos", 400, details, error.code);

		case APIErrorCode.RateLimited:
			return new NotionClientError(
				"Límite de requests excedido",
				429,
				details,
				error.code
			);

		// ✅ Errores del servidor (500s)
		case APIErrorCode.InternalServerError:
			return new NotionServerError(
				"Error interno de Notion",
				502,
				details,
				error.code
			);

		case APIErrorCode.ServiceUnavailable:
			return new NotionServerError(
				"Servicio de Notion no disponible",
				503,
				details,
				error.code
			);

		case ClientErrorCode.RequestTimeout:
			return new NotionServerError(
				"Timeout de conexión",
				408,
				details,
				error.code
			);

		// ✅ Error genérico
		default:
			return new ServerError("Error desconocido", 500, details);
	}
};

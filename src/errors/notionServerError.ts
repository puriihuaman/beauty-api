import { ServerError } from "./exception.ts";

export class NotionServerError extends ServerError {
	public code: string;

	constructor(message: string, status: number, details: string, code: string) {
		super(message, status, details);
		this.code = code;
		this.name = "NotionServerError";
	}
}

import { UnauthorizedError } from "./exception.ts";

export class NotionUnauthorizedError extends UnauthorizedError {
	public code: string;

	constructor(message: string, status: number, details: string, code: string) {
		super(message, status, details);
		this.code = code;
		this.name = "NotionUnauthorizedError";
	}
}

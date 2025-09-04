import { ClientError } from "./exception.ts";

export class NotionClientError extends ClientError {
	public code: string;

	constructor(message: string, status: number, details: string, code: string) {
		super(message, status, details);
		this.code = code;
		this.name = "NotionClientError";
	}
}

export class ClientError extends Error {
	private _statusCode: number;
	private _details: string;

	constructor(message: string, status: number = 400, details: string) {
		super(message);
		this._statusCode = status;
		this._details = details;
	}

	public get statusCode() {
		return this._statusCode;
	}

	public get details() {
		return this._details;
	}
}

export class ServerError extends Error {
	private _statusCode: number;
	private _details: string;

	constructor(message: string, status: number = 500, details: string) {
		super(message);
		this._statusCode = status;
		this._details = details;
	}

	public get statusCode() {
		return this._statusCode;
	}

	public get details() {
		return this._details;
	}
}

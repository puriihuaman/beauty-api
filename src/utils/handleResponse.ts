import type { Response } from "express";

interface ResponseSuccessDto<T> {
	hasError: boolean;
	statusCode: number;
	message: string;
	data: T | T[];
}

export const handleResponse = <T>(
	res: Response,
	statusCode: number = 200,
	data: T,
	message: string
) => {
	res.status(statusCode).json({
		hasError: false,
		statusCode,
		message,
		data,
	});
};

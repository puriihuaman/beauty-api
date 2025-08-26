import type { Response } from "express";

export const handleError = (
	res: Response,
	statusCode: number = 400,
	message: string,
	details: string
) => {
	res.status(statusCode).json({
		hasError: true,
		statusCode,
		message,
		details,
	});
};

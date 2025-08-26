import type { NextFunction, Request, Response } from "express";

export const cachedAsync = <
	T extends (req: Request, res: Response) => Promise<any>
>(
	fn: T
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res).catch((error) => next(error));
	};
};

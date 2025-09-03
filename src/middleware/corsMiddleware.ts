import cors, { type CorsOptions } from "cors";
import { env } from "../config/environment.ts";

const ACCEPTED_ORIGINS: string[] = [
	...env.CORS.origin,
	"http://localhost:5173",
	"http://localhost:4200",
];
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const corsOptions: CorsOptions = {
	origin(requestOrigin: string | undefined, callback) {
		if (requestOrigin && ACCEPTED_ORIGINS.includes(requestOrigin)) {
			return callback(null, true);
		}

		if (!requestOrigin) {
			return callback(null, true);
		}
		return callback(new Error("Not allowed by CORS"));
	},
	methods: ALLOWED_METHODS,
	credentials: true,
	optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);

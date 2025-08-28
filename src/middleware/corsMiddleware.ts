import cors, { type CorsOptions } from "cors";

const FRONT_END_DOMAIN = process.env.DOMAIN_BEAUTY;

const ACCEPTED_ORIGINS = [
	FRONT_END_DOMAIN,
	"http://localhost:5173",
	"http://localhost:4200",
];
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const corsOptions: CorsOptions = {
	origin(requestOrigin, callback) {
		if (ACCEPTED_ORIGINS.includes(requestOrigin)) {
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

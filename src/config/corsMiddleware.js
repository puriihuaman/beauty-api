const cors = require("cors");

const FRONT_END_DOMAIN = process.env.DOMAIN_BEAUTY;

const ACCEPTED_ORIGINS = [
	FRONT_END_DOMAIN,
	"http://localhost:5173",
	"http://localhost:4200",
];
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const corsOptions = {
	origin: (origin, cb) => {
		if (ACCEPTED_ORIGINS.includes(origin)) {
			return cb(null, true);
		}

		if (!origin) {
			return cb(null, true);
		}
		return cb(new Error("Not allowed by CORS"));
	},
	methods: ALLOWED_METHODS,
	credentials: true,
	optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;

import { createApp } from "./app.ts";
import { env } from "./config/environment.ts";

async function startServer(): Promise<void> {
	try {
		const app = createApp();

		app.listen(env.PORT, () => {
			console.log(`✅ Servidor corriendo en puerto ${env.PORT}`);
		});
	} catch (error: any) {
		process.exit(1);
	}
}

startServer();

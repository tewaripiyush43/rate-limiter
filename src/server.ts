import "dotenv/config";
import app from "./app.js";
import client from "./config/redis.js";
import { ENV } from "./config/env.js";
import { logger } from "./utils/logger.js";

const PORT = ENV.PORT || 9001;
let shuttingDown = false;

client.connect().catch((err: any) => {
    logger.error("Redis connection error during startup", err);
});

client.on("ready", () => {
    logger.info("Redis server is connected and ready");
});

const server = app.listen(PORT, () => {
    logger.info(`Server is running on ${PORT}`, { port: PORT });
});

process.on("SIGTERM", shutdownHandler);
process.on("SIGINT", shutdownHandler);

function shutdownHandler() {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info("Termination signal received, shutting down gracefully...");

    setTimeout(() => {
        logger.error("Forcefully shutting down because graceful shutdown timed out");
        process.exit(1);
    }, 10000);

    server.close(async () => {
        logger.info("HTTP server is closed");

        try {
            await Promise.race([
                client.quit(),
                new Promise((_, resolve) => setTimeout(() => {
                    client.destroy();
                    resolve(null);
                }, 500))
            ]);
            logger.info("Redis connection closed");
        } catch (err) {
            logger.error("Error during Redis client shutdown", err);
        }
        process.exit(0);
    });
}
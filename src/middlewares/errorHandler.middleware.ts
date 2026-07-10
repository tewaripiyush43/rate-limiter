import { Request, Response, NextFunction } from "express";
import { ServiceNotFoundError } from "../errors/ServiceNotFoundError.js";
import { InvalidApiKeyError } from "../errors/InvalidApiKeyError.js";
import { GatewayTimeoutError } from "../errors/GatewayTimeoutError.js";
import { logger } from "../utils/logger.js";

export default function errorHandler(
    err: Error | any,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    if (res.headersSent) {
        return;
    }

    const context = {
        requestId: req.requestId,
        tenantKey: req.client?.key,
        tenantName: req.client?.name,
        plan: req.client?.plan,
        method: req.method,
        url: req.originalUrl
    };

    if (err instanceof ServiceNotFoundError) {
        logger.warn(`Service not found: ${err.message}`, context);
        res.status(404).json({ error: "SERVICE_NOT_FOUND", message: err.message });
        return;
    }

    if (err instanceof InvalidApiKeyError) {
        logger.warn(`Unauthorized request: ${err.message}`, context);
        res.status(401).json({ error: "UNAUTHORIZED", message: err.message });
        return;
    }

    if (err instanceof GatewayTimeoutError) {
        logger.error(`Gateway Timeout: ${err.message}`, err, context);
        res.status(504).json({ error: "GATEWAY_TIMEOUT", message: err.message });
        return;
    }

    logger.error(`Unhandled error occurred: ${err.message || err}`, err, context);
    res.status(500).json({
        error: err.name ? err.name : "INTERNAL_SERVER_ERROR",
        message: err.message ? err.message : "Something went wrong"
    });
}
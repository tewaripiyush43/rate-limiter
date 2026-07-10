import { metrics } from "../metrics/metrics.js";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export default function metricMiddleware(req: Request, res: Response, next: NextFunction) {
    metrics.recordRequest();
    const start = performance.now();

    res.on("finish", () => {
        const latency = performance.now() - start;
        metrics.recordLatency(latency)

        if (res.statusCode === 429) {
            metrics.recordBlocked();
        }

        logger.info(`Request completed: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`, {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            latencyMs: parseFloat(latency.toFixed(2)),
            plan: req.client?.plan || "anonymous"
        });
    })

    next()
}
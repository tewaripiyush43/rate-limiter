import { ENV } from "../config/env.js";
import { NextFunction, Request, Response } from "express";
import { getDownstreamUrl } from "./downstreamUrlResolver.js";
import { GatewayTimeoutError } from "../errors/GatewayTimeoutError.js";
import { logger } from "../utils/logger.js";

export default async function proxyHandler(req: Request, res: Response, next: NextFunction) {
    const abortController = new AbortController();

    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, 10000); // 10 seconds

    try {
        const targetUrl = getDownstreamUrl(req.originalUrl, req.client!);
        const forbiddenHeaders: Set<string> = new Set([
            "connection",
            "host",
            "content-length",
            "transfer-encoding"
        ]);

        const headers: Record<string, string> = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (!forbiddenHeaders.has(key.toLowerCase()) && value !== undefined) {
                headers[key] = Array.isArray(value) ? value.join(", ") : value;
            }
        })

        // Stream raw body through to target natively
        const options: RequestInit = {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === "HEAD" ? undefined : (req as any).readable ? req : undefined,
            signal: abortController.signal,
            // @ts-ignore Node 18+ allows duplex streams
            duplex: "half"
        }

        const maxRetries = (req.method === 'GET' || req.method === 'HEAD') ? 3 : 0;
        const initialDelayMs = 100;
        const backoffFactor = 2;
        const jitterFactor = 0.2;

        let attempt = 0;
        let response: globalThis.Response | null = null;
        let lastError: any = null;

        while (attempt <= maxRetries) {
            if (attempt > 0) {
                const backoffDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
                const jitterMultiplier = 1 + (Math.random() * 2 - 1) * jitterFactor;
                const finalDelay = backoffDelay * jitterMultiplier;

                logger.warn(`Retrying downstream proxy request. Attempt ${attempt}/${maxRetries} after ${finalDelay.toFixed(0)}ms.`, {
                    requestId: req.requestId,
                    tenantKey: req.client?.key,
                    tenantName: req.client?.name,
                    plan: req.client?.plan,
                    attempt,
                    delayMs: parseFloat(finalDelay.toFixed(2)),
                    url: targetUrl
                });

                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(resolve, finalDelay);
                    abortController.signal.addEventListener("abort", () => {
                        clearTimeout(timeout);
                        reject(new DOMException("Aborted", "AbortError"));
                    });
                });
            }

            try {
                response = await fetch(targetUrl, options);
                
                if (response.status < 500) {
                    break;
                }
                
                lastError = new Error(`Downstream service returned status ${response.status}`);
            } catch (err: any) {
                if (err.name === "AbortError" || abortController.signal.aborted) {
                    throw err;
                }
                lastError = err;
            }

            attempt++;
        }

        if (!response) {
            throw lastError || new Error("Failed to contact downstream service.");
        }

        const validResponse: globalThis.Response = response;

        // Pipe downstream response to client
        res.status(validResponse.status);
        validResponse.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        if (validResponse.body) {
            // Wait for stream to finish piping
            for await (const chunk of validResponse.body as any) {
                res.write(chunk);
            }
            res.end();
        } else {
            res.end();
        }

    }
    catch (err: any) {
        if (err.name === "AbortError") {
            next(new GatewayTimeoutError("Downstream service timed out."));
        } else {
            next(err);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}
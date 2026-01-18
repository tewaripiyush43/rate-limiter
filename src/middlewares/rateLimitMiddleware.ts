import rateLimiter from "#rate-limiter/index.js";
import { Request, Response, NextFunction } from "express";

export default async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const identifier = String(req.ip);
    const strategy = rateLimiter(process.env.RATE_LIMIT_STRATEGY);
    if (await strategy.isRequestAllowed(identifier) === true) {
        next();
    } else {
        res.status(429).send({
            status: 429,
            message: "Too many Requests"
        })
    }
}
import isRequestAllowed from "#rate-limiter/strategies/fixedWindow.js";
import { Request, Response, NextFunction } from "express";

export default async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const identifier = String(req.ip);
    if (await isRequestAllowed(identifier) === true) {
        next();
    } else {
        res.status(429).send({
            status: 429,
            message: "Too many Requests"
        })
    }
}
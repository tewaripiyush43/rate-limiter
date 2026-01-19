import { Request } from "express";

export interface RateLimiterOptions {
    limit: number;
    windowInSeconds: number;
    strategy?: "fixed" | "sliding";
    identifier?: (req: Request) => string;
}

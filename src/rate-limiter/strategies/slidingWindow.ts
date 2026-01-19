import client from "#config/redis.js";
import RateLimitStrategy from "./rateLimitStrategy.js";
import crypto from "crypto";

export default class SlidingWindow implements RateLimitStrategy {
    async isRequestAllowed(
        identifier: string,
        limit: number,
        windowInSeconds: number
    ): Promise<boolean> {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const key = `sw:${identifier}`;

        try {
            await client.zRemRangeByScore(
                key,
                0,
                nowInSeconds - windowInSeconds
            );

            await client.zAdd(key, {
                score: nowInSeconds,
                value: crypto.randomUUID()
            });

            await client.expire(key, windowInSeconds);

            const count = await client.zCard(key);
            return count <= limit;
        } catch (err) {
            // fail-open
            return true;
        }
    }
}
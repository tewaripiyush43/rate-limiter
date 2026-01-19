import client from "#config/redis.js";
import RateLimitStrategy from "./rateLimitStrategy.js";

export default class FixedWindow implements RateLimitStrategy {
    async isRequestAllowed(
        identifier: string,
        limit: number,
        windowInSeconds: number
    ): Promise<boolean> {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const windowStart =
            Math.floor(nowInSeconds / windowInSeconds) * windowInSeconds;

        const key = `fw:${identifier}:${windowStart}`;

        try {
            const count = await client.incr(key);

            if (count === 1) {
                await client.expire(key, windowInSeconds);
            }

            if (count > limit) {
                return false;
            }

            return true;
        } catch (err) {
            return true;
        }
    }
}

import client from "#config/redis.js";
import rateLimitStrategy from "./rateLimitStrategy.js";
const LIMIT = 25;
const WINDOW_SIZE = 60;

export default class FixedWindow implements rateLimitStrategy {
    async isRequestAllowed(identifier: string): Promise<boolean> {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const windowIndex = Math.floor(nowInSeconds / WINDOW_SIZE);
        const windowStart = windowIndex * WINDOW_SIZE;

        const key = `fw:${identifier}:${windowStart}`;

        try {
            const count = await client.incr(key);

            if (count === 1) {
                await client.expire(key, WINDOW_SIZE);

            } else if (count > LIMIT) {
                return false;
            }

        } catch (err) {
            console.log(err);
            return true;
        }
        return true;
    }
};
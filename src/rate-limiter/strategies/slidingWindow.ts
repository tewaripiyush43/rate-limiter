import client from "#config/redis.js";
import rateLimitStrategy from "./rateLimitStrategy.js";
const LIMIT = 25;
const WINDOW_SIZE = 60;

export default class SlidingWindow implements rateLimitStrategy {

    async isRequestAllowed(identifier: string): Promise<boolean> {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const key = `sw:${identifier}`;

        try {
            await client.zRemRangeByScore(key, 0, nowInSeconds - WINDOW_SIZE);
            await client.zAdd(key, { score: nowInSeconds, value: `${nowInSeconds}-${crypto.randomUUID()}` });
            await client.expire(key, WINDOW_SIZE);

            const count = await client.zCard(key);

            if (count > LIMIT) {
                return false;
            }
        }
        catch (err) {
            console.log(err);
            return true;
        }

        return true;
    }
}
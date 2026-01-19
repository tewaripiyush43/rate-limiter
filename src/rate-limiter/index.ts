import FixedWindow from "./strategies/fixedWindow.js";
import SlidingWindow from "./strategies/slidingWindow.js";
import RateLimitStrategy from "./strategies/rateLimitStrategy.js";

export function selectRateLimitStrategy(
    strategy?: string
): RateLimitStrategy {
    if (strategy === "sliding") {
        return new SlidingWindow();
    }

    return new FixedWindow();
}
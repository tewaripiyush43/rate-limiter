import FixedWindow from "./strategies/fixedWindow.js";
import SlidingWindow from "./strategies/slidingWindow.js";
import rateLimitStrategy from "./strategies/rateLimitStrategy.js";

const rateLimiter = (strategy: string | undefined): rateLimitStrategy => {
    if (strategy == "fixed") {
        return new FixedWindow()
    } else if (strategy == "sliding") {
        return new SlidingWindow();
    } else {
        throw new Error("Unknown strategy: " + strategy);
    }
}

export default rateLimiter;
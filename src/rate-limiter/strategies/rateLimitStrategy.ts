export default interface RateLimitStrategy {
    isRequestAllowed(
        identifier: string,
        limit: number,
        windowInSeconds: number
    ): Promise<boolean>;
}

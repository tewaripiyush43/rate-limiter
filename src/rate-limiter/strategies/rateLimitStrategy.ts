export default interface rateLimitStrategy {
    isRequestAllowed(identifier: string): Promise<boolean>;
}
export const logger = {
    info(message: string, context?: Record<string, any>) {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "INFO",
            message,
            ...context
        }));
    },
    warn(message: string, context?: Record<string, any>) {
        console.warn(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "WARN",
            message,
            ...context
        }));
    },
    error(message: string, error?: any, context?: Record<string, any>) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "ERROR",
            message,
            error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
            ...context
        }));
    }
};

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function serializeError(err: unknown): LogContext {
    if (err instanceof Error) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
    }
    return { value: String(err) };
}

function write(level: LogLevel, message: string, context?: LogContext) {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context,
    };

    const line = JSON.stringify(payload);
    if (level === "error") {
        console.error(line);
        return;
    }
    if (level === "warn") {
        console.warn(line);
        return;
    }
    if (level === "info") {
        console.info(line);
        return;
    }
    console.debug(line);
}

export const logger = {
    debug(message: string, context?: LogContext) {
        write("debug", message, context);
    },
    info(message: string, context?: LogContext) {
        write("info", message, context);
    },
    warn(message: string, context?: LogContext) {
        write("warn", message, context);
    },
    error(message: string, err?: unknown, context?: LogContext) {
        write("error", message, {
            ...context,
            ...(err !== undefined ? { error: serializeError(err) } : {}),
        });
    },
};

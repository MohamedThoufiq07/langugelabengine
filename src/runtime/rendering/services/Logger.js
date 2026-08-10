class Logger {
    constructor() {
        this.logs = [];
    }

    /**
     * Log information.
     */
    info(message, data = null) {
        this.write("INFO", message, data);
    }

    /**
     * Log warning.
     */
    warn(message, data = null) {
        this.write("WARN", message, data);
    }

    /**
     * Log error.
     */
    error(message, data = null) {
        this.write("ERROR", message, data);
    }

    /**
     * Log debug message.
     */
    debug(message, data = null) {
        this.write("DEBUG", message, data);
    }

    /**
     * Internal log writer.
     */
    write(level, message, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };

        this.logs.push(entry);

        if (import.meta.env.DEV) {
            console.log(
                `[${level}] ${message}`,
                data ?? ""
            );
        }
    }

    /**
     * Returns all logs.
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Clears log history.
     */
    clear() {
        this.logs = [];
    }
}

export default Logger;
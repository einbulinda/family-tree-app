interface LogEntry {
  timestamp: Date;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
  context?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 logs
  private readonly isDevelopment = process.env.NODE_ENV !== "production";

  log(
    level: "DEBUG" | "INFO" | "WARN" | "ERROR",
    message: string,
    context?: any
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
    };

    this.logs.push(logEntry);

    //Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    //Console output only in development
    if (this.isDevelopment) {
      const formattedMessage = `[${level}] ${message}`;
      switch (level) {
        case "ERROR":
          console.error(formattedMessage, context);
          break;
        case "WARN":
          console.warn(formattedMessage, context);
          break;
        case "DEBUG":
          console.debug(formattedMessage, context);
          break;
        default:
          console.log(formattedMessage, context);
      }
    }
  }

  debug(message: string, context?: any) {
    this.log("DEBUG", message, context);
  }

  info(message: string, context?: any) {
    this.log("INFO", message, context);
  }

  warn(message: string, context?: any) {
    this.log("WARN", message, context);
  }

  error(message: string, context?: any) {
    this.log("ERROR", message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return this.logs
      .map(
        (log) =>
          `${log.timestamp.toISOString()} [${log.level}] ${log.message} ${
            log.context ? JSON.stringify(log.context) : ""
          }`
      )
      .join("\n");
  }
}

export const logger = new Logger();

// Export a function to get logger instance for debugging
export const getLogger = () => logger;

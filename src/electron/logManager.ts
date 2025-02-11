class LogManager {
  private logs: string[] = [];
  private debugMessages: string[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  addLog(message: string) {
    if (this.logs.length >= this.maxEntries) {
      this.logs.shift();
    }
    this.logs.push(message);
  }

  addDebugMessage(message: string) {
    if (this.debugMessages.length >= this.maxEntries) {
      this.debugMessages.shift();
    }
    this.debugMessages.push(message);
  }

  getLogs(): string[] {
    return [];
  }

  getDebugMessages(): string[] {
    return [];
  }

  clearLogs() {
    this.logs = [];
  }

  clearDebugMessages() {
    this.debugMessages = [];
  }
}

export const logManager = new LogManager(1000);

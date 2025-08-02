import config from '../config';

export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  static info(message: string, meta?: any): void {
    if (config.logging.enableConsole) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  static warn(message: string, meta?: any): void {
    if (config.logging.enableConsole) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  static error(message: string, error?: Error | any): void {
    if (config.logging.enableConsole) {
      console.error(this.formatMessage('error', message, error?.message));
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }

  static debug(message: string, meta?: any): void {
    if (config.logging.enableConsole && config.server.nodeEnv === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < config.game.roomIdLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const ensureUniqueRoomId = (existingIds: Set<string>): string => {
  let roomId: string;
  do {
    roomId = generateRoomId();
  } while (existingIds.has(roomId));
  return roomId;
};

export const safeJsonStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Handle Map objects
      if (value instanceof Map) {
        return Array.from(value.entries());
      }
      return value;
    });
  } catch (error) {
    Logger.error('Failed to stringify object', error);
    return '{}';
  }
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export { ToastResponseHandler } from './ToastResponseHandler';

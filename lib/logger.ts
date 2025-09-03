// Simple logger utility
export const logger = {
  info: (message: string, ...args: unknown[]) => {

  },
  error: (message: string, ...args: unknown[]) => {

  },
  warn: (message: string, ...args: unknown[]) => {

  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {

    }
  }
};
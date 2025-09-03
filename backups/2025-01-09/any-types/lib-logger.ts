// Simple logger utility
export const logger = {
  info: (message: string, ...args: any[]) => {

  },
  error: (message: string, ...args: any[]) => {

  },
  warn: (message: string, ...args: any[]) => {

  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {

    }
  }
};
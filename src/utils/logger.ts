/**
 * Logger simple y efectivo para el proyecto.
 *
 * Proporciona logging con colores y timestamps sin complejidad innecesaria.
 */

const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
} as const;

function timestamp(): string {
  return new Date().toISOString().substring(11, 23); // HH:mm:ss.SSS
}

export const logger = {
  info(message: string, ...args: unknown[]): void {
    console.log(
      `${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.blue}ℹ${COLORS.reset} ${message}`,
      ...args
    );
  },

  success(message: string, ...args: unknown[]): void {
    console.log(
      `${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.green}✓${COLORS.reset} ${message}`,
      ...args
    );
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(
      `${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}⚠${COLORS.reset} ${message}`,
      ...args
    );
  },

  error(message: string, error?: unknown): void {
    console.error(
      `${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.red}✗${COLORS.reset} ${message}`
    );
    if (error) {
      console.error(error);
    }
  },

  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG) {
      console.log(`${COLORS.gray}[${timestamp()}] [DEBUG]${COLORS.reset} ${message}`, ...args);
    }
  },
};

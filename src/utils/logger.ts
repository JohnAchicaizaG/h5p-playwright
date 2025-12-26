import { serializeError } from './errors.js';

/**
 * Niveles de logging disponibles.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Configuración del logger.
 */
export interface LoggerConfig {
  /**
   * Nivel mínimo de logging.
   * Mensajes por debajo de este nivel serán ignorados.
   */
  level: LogLevel;

  /**
   * Si se debe incluir timestamp en los logs.
   */
  includeTimestamp: boolean;

  /**
   * Si se debe colorear la salida (solo para consola).
   */
  colorize: boolean;

  /**
   * Prefijo para todos los mensajes de log.
   */
  prefix?: string;
}

/**
 * Colores ANSI para la salida en consola.
 */
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
} as const;

/**
 * Logger estructurado para el proyecto.
 *
 * Proporciona logging con niveles, timestamps, colores y contexto adicional.
 * Más profesional que console.log y facilita el debugging.
 */
export class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      includeTimestamp: true,
      colorize: true,
      ...config,
    };
  }

  /**
   * Establece el nivel de logging.
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Formatea un timestamp para los logs.
   */
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Aplica color a un string si colorize está habilitado.
   */
  private colorize(text: string, color: keyof typeof COLORS): string {
    if (!this.config.colorize) {
      return text;
    }
    return `${COLORS[color]}${text}${COLORS.reset}`;
  }

  /**
   * Obtiene el emoji y color para cada nivel.
   */
  private getLevelInfo(level: LogLevel): {
    emoji: string;
    color: keyof typeof COLORS;
    label: string;
  } {
    switch (level) {
      case LogLevel.DEBUG:
        return { emoji: '🔍', color: 'gray', label: 'DEBUG' };
      case LogLevel.INFO:
        return { emoji: 'ℹ️', color: 'blue', label: 'INFO' };
      case LogLevel.WARN:
        return { emoji: '⚠️', color: 'yellow', label: 'WARN' };
      case LogLevel.ERROR:
        return { emoji: '❌', color: 'red', label: 'ERROR' };
      default:
        return { emoji: '', color: 'reset', label: 'LOG' };
    }
  }

  /**
   * Formatea un mensaje de log.
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): string {
    const parts: string[] = [];

    // Timestamp
    if (this.config.includeTimestamp) {
      parts.push(this.colorize(this.formatTimestamp(), 'dim'));
    }

    // Nivel
    const levelInfo = this.getLevelInfo(level);
    parts.push(levelInfo.emoji);
    parts.push(this.colorize(levelInfo.label.padEnd(5), levelInfo.color));

    // Prefijo
    if (this.config.prefix) {
      parts.push(this.colorize(`[${this.config.prefix}]`, 'cyan'));
    }

    // Mensaje
    parts.push(message);

    let formatted = parts.join(' ');

    // Contexto adicional
    if (context && Object.keys(context).length > 0) {
      const contextStr = JSON.stringify(context, null, 2);
      formatted += `\n${this.colorize('Context:', 'dim')} ${contextStr}`;
    }

    return formatted;
  }

  /**
   * Verifica si un nivel debe ser loggeado.
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Log de nivel DEBUG.
   * Para información de debugging detallada.
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  /**
   * Log de nivel INFO.
   * Para mensajes informativos generales.
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  /**
   * Log de nivel WARN.
   * Para advertencias que no impiden la ejecución.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  /**
   * Log de nivel ERROR.
   * Para errores que requieren atención.
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const fullContext = {
        ...context,
        ...(error ? { error: serializeError(error) } : {}),
      };
      console.error(this.formatMessage(LogLevel.ERROR, message, fullContext));
    }
  }

  /**
   * Crea un logger hijo con un prefijo adicional.
   * Útil para separar logs de diferentes módulos.
   */
  child(prefix: string): Logger {
    const childPrefix = this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix;

    return new Logger({
      ...this.config,
      prefix: childPrefix,
    });
  }

  /**
   * Inicia un grupo de logs relacionados.
   */
  group(label: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.group(this.colorize(`▶ ${label}`, 'bright'));
    }
  }

  /**
   * Finaliza un grupo de logs.
   */
  groupEnd(): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.groupEnd();
    }
  }

  /**
   * Mide el tiempo de una operación.
   *
   * @example
   * ```ts
   * const stopTimer = logger.time('Login');
   * await performLogin();
   * stopTimer();
   * ```
   */
  time(label: string): () => void {
    if (!this.shouldLog(LogLevel.DEBUG)) {
      return () => {};
    }

    const start = Date.now();
    this.debug(`⏱️ Iniciando: ${label}`);

    return () => {
      const duration = Date.now() - start;
      this.debug(`⏱️ Completado: ${label}`, { durationMs: duration });
    };
  }
}

/**
 * Logger por defecto para el proyecto.
 */
export const logger = new Logger({
  level: process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.INFO,
  includeTimestamp: true,
  colorize: true,
});

/**
 * Logger específico para operaciones de login.
 */
export const loginLogger = logger.child('Login');

/**
 * Logger específico para operaciones de sesión.
 */
export const sessionLogger = logger.child('Session');

/**
 * Logger específico para operaciones de navegación.
 */
export const navigationLogger = logger.child('Navigation');

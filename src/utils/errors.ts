/**
 * Errores personalizados para el proyecto H5P Playwright.
 *
 * Cada clase de error tiene un propósito específico y proporciona
 * contexto detallado para facilitar el debugging y manejo de errores.
 */

/**
 * Error base para todos los errores del proyecto.
 */
export abstract class H5PAutomationError extends Error {
  /**
   * Código de error para identificación programática.
   */
  public readonly code: string;

  /**
   * Contexto adicional sobre el error.
   */
  public readonly context: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    context: Record<string, unknown> | undefined = undefined
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // Mantiene el stack trace correcto en V8
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error cuando una variable de entorno requerida no está definida.
 */
export class EnvironmentVariableError extends H5PAutomationError {
  constructor(variableName: string) {
    super(`Variable de entorno requerida no encontrada: ${variableName}`, 'ENV_VAR_MISSING', {
      variableName,
    });
  }
}

/**
 * Error cuando el login falla.
 */
export class LoginError extends H5PAutomationError {
  constructor(message: string, url?: string, cause?: Error) {
    super(`Error durante el login: ${message}`, 'LOGIN_FAILED', {
      url,
      originalError: cause?.message,
    });

    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error cuando la verificación de sesión falla.
 */
export class SessionVerificationError extends H5PAutomationError {
  constructor(message: string, url?: string) {
    super(`Error al verificar la sesión: ${message}`, 'SESSION_VERIFICATION_FAILED', { url });
  }
}

/**
 * Error cuando un elemento no se encuentra en la página.
 */
export class ElementNotFoundError extends H5PAutomationError {
  constructor(selector: string, timeoutMs: number, url?: string) {
    super(`Elemento no encontrado: ${selector} (timeout: ${timeoutMs}ms)`, 'ELEMENT_NOT_FOUND', {
      selector,
      timeout: timeoutMs,
      url,
    });
  }
}

/**
 * Error cuando la navegación falla o timeout.
 */
export class NavigationError extends H5PAutomationError {
  constructor(targetUrl: string, currentUrl?: string, cause?: Error) {
    super(`Error al navegar a: ${targetUrl}`, 'NAVIGATION_FAILED', {
      targetUrl,
      currentUrl,
      originalError: cause?.message,
    });

    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error cuando se alcanza el número máximo de reintentos.
 */
export class MaxRetriesExceededError extends H5PAutomationError {
  constructor(operation: string, attempts: number, lastError?: Error) {
    super(
      `Máximo de reintentos alcanzado para: ${operation} (${attempts} intentos)`,
      'MAX_RETRIES_EXCEEDED',
      { operation, attempts, lastError: lastError?.message }
    );

    if (lastError) {
      this.stack = `${this.stack}\nLast error: ${lastError.stack}`;
    }
  }
}

/**
 * Error cuando la configuración es inválida.
 */
export class ConfigurationError extends H5PAutomationError {
  constructor(message: string, config?: Record<string, unknown>) {
    super(`Error de configuración: ${message}`, 'INVALID_CONFIGURATION', config);
  }
}

/**
 * Error cuando falla la carga o guardado del estado de sesión.
 */
export class SessionStateError extends H5PAutomationError {
  constructor(operation: 'load' | 'save', filePath: string, cause?: Error) {
    super(
      `Error al ${operation === 'load' ? 'cargar' : 'guardar'} estado de sesión: ${filePath}`,
      'SESSION_STATE_ERROR',
      { operation, filePath, originalError: cause?.message }
    );

    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Verifica si un error es de un tipo específico.
 *
 * @param error - Error a verificar
 * @param errorType - Tipo de error esperado
 * @returns true si el error es del tipo especificado
 */
export function isErrorOfType<T extends H5PAutomationError>(
  error: unknown,
  errorType: new (...args: any[]) => T
): error is T {
  return error instanceof errorType;
}

/**
 * Extrae información útil de un error para logging.
 *
 * @param error - Error del cual extraer información
 * @returns Objeto con información del error
 */
export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof H5PAutomationError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      context: error.context,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    error: String(error),
  };
}

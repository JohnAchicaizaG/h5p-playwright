import { MaxRetriesExceededError } from './errors.js';

/**
 * Opciones para la lógica de reintentos.
 */
export interface RetryOptions {
  /**
   * Número máximo de intentos (incluyendo el primero).
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Tiempo de espera inicial entre reintentos en milisegundos.
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Factor de multiplicación para el delay en cada reintento.
   * @default 2
   */
  backoffFactor?: number;

  /**
   * Tiempo máximo de espera entre reintentos en milisegundos.
   * @default 10000
   */
  maxDelay?: number;

  /**
   * Función que determina si se debe reintentar después de un error.
   * Por defecto, reintenta todos los errores.
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /**
   * Callback opcional que se llama antes de cada reintento.
   */
  onRetry?: (error: Error, attempt: number, nextDelay: number) => void;
}

/**
 * Configuración por defecto para reintentos.
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 10_000,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Calcula el delay para el siguiente reintento usando exponential backoff.
 *
 * @param attempt - Número de intento actual
 * @param options - Opciones de retry
 * @returns Tiempo de espera en milisegundos
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1);
  return Math.min(exponentialDelay, options.maxDelay);
}

/**
 * Espera un tiempo determinado.
 *
 * @param ms - Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo especificado
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ejecuta una función asíncrona con lógica de reintentos.
 *
 * Usa exponential backoff para espaciar los reintentos, lo cual ayuda
 * a evitar sobrecargar el sistema y da tiempo para que condiciones
 * temporales se resuelvan.
 *
 * @template T - Tipo del valor de retorno
 * @param fn - Función a ejecutar
 * @param options - Opciones de retry
 * @param operationName - Nombre descriptivo de la operación (para errores)
 * @returns Promise con el resultado de la función
 * @throws {MaxRetriesExceededError} Si se alcanza el máximo de reintentos
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   async () => await page.click('#submit'),
 *   { maxAttempts: 3, initialDelay: 1000 },
 *   'Click en botón submit'
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  operationName = 'operación'
): Promise<T> {
  const opts: Required<RetryOptions> = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si es el último intento o no se debe reintentar, lanzar el error
      if (attempt === opts.maxAttempts || !opts.shouldRetry(lastError, attempt)) {
        break;
      }

      // Calcular el delay para el siguiente intento
      const delay = calculateDelay(attempt, opts);

      // Notificar sobre el reintento
      opts.onRetry(lastError, attempt, delay);

      // Esperar antes del siguiente intento
      await sleep(delay);
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw new MaxRetriesExceededError(operationName, opts.maxAttempts, lastError);
}

/**
 * Crea una función de retry personalizada con opciones pre-configuradas.
 *
 * Útil para crear funciones de retry específicas para diferentes tipos
 * de operaciones con sus propias configuraciones.
 *
 * @param defaultOptions - Opciones por defecto para esta función de retry
 * @returns Función de retry configurada
 *
 * @example
 * ```ts
 * const retryNetworkOperation = createRetryFunction({
 *   maxAttempts: 5,
 *   initialDelay: 2000,
 *   shouldRetry: (error) => error.message.includes('timeout')
 * });
 *
 * await retryNetworkOperation(
 *   async () => await fetch('https://api.example.com'),
 *   'API fetch'
 * );
 * ```
 */
export function createRetryFunction(defaultOptions: RetryOptions) {
  return async <T>(fn: () => Promise<T>, operationName?: string): Promise<T> => {
    return withRetry(fn, defaultOptions, operationName);
  };
}

/**
 * Opciones de retry optimizadas para operaciones de UI.
 *
 * Usa delays más cortos ya que los elementos de UI generalmente
 * aparecen rápidamente o no aparecen en absoluto.
 */
export const UI_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 500,
  backoffFactor: 1.5,
  maxDelay: 3000,
};

/**
 * Opciones de retry optimizadas para operaciones de red.
 *
 * Usa delays más largos para dar tiempo a que se resuelvan
 * problemas de conectividad temporales.
 */
export const NETWORK_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 5,
  initialDelay: 2000,
  backoffFactor: 2,
  maxDelay: 30_000,
};

/**
 * Función de retry pre-configurada para operaciones de UI.
 */
export const retryUIOperation = createRetryFunction(UI_RETRY_OPTIONS);

/**
 * Función de retry pre-configurada para operaciones de red.
 */
export const retryNetworkOperation = createRetryFunction(NETWORK_RETRY_OPTIONS);

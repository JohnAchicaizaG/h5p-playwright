import 'dotenv/config';
import type { H5PCredentials, BrowserConfig } from '../types/index.js';
import { EnvironmentVariableError } from './errors.js';

/**
 * Obtiene el valor de una variable de entorno requerida.
 *
 * @param name - Nombre de la variable de entorno
 * @returns El valor de la variable de entorno
 * @throws {EnvironmentVariableError} Si la variable de entorno no está definida
 *
 * @example
 * ```ts
 * const apiKey = getRequiredEnv('API_KEY');
 * ```
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new EnvironmentVariableError(name);
  }
  return value;
}

/**
 * Obtiene el valor de una variable de entorno opcional.
 *
 * @param name - Nombre de la variable de entorno
 * @param defaultValue - Valor por defecto si la variable no está definida
 * @returns El valor de la variable o el valor por defecto
 *
 * @example
 * ```ts
 * const port = getOptionalEnv('PORT', '3000');
 * ```
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

/**
 * Obtiene una variable de entorno booleana.
 *
 * @param name - Nombre de la variable de entorno
 * @param defaultValue - Valor por defecto si la variable no está definida
 * @returns true si el valor es 'true' (case-insensitive), false en caso contrario
 *
 * @example
 * ```ts
 * const isDebug = getBooleanEnv('DEBUG', false);
 * ```
 */
export function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

/**
 * Obtiene las credenciales de H5P desde las variables de entorno.
 *
 * @returns Las credenciales del usuario
 * @throws {EnvironmentVariableError} Si faltan las variables H5P_USER o H5P_PASS
 *
 * @example
 * ```ts
 * const credentials = getH5PCredentials();
 * console.log(credentials.username);
 * ```
 */
export function getH5PCredentials(): H5PCredentials {
  return {
    username: getRequiredEnv('H5P_USER'),
    password: getRequiredEnv('H5P_PASS'),
  };
}

/**
 * Obtiene la configuración del navegador desde las variables de entorno.
 *
 * @param baseConfig - Configuración base a extender
 * @returns Configuración del navegador con valores de entorno aplicados
 *
 * @example
 * ```ts
 * const config = getBrowserConfigFromEnv(defaultConfig);
 * console.log(config.headless);
 * ```
 */
export function getBrowserConfigFromEnv(baseConfig: BrowserConfig): BrowserConfig {
  return {
    ...baseConfig,
    headless: getBooleanEnv('HEADLESS', baseConfig.headless),
  };
}

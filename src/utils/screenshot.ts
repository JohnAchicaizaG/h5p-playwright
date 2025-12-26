import { pathConfig } from '../config/browser.config.js';

/**
 * Genera un nombre de archivo con timestamp para screenshots.
 * 
 * Crea nombres únicos usando la fecha y hora actual, evitando que
 * múltiples screenshots se sobrescriban entre sí.
 * 
 * @param prefix - Prefijo del archivo (ej: 'error', 'login-error', 'session-error')
 * @returns Ruta completa del archivo con timestamp en formato: screenshots/prefix_YYYY-MM-DD_HH-mm-ss.png
 * 
 * @example
 * ```ts
 * generateScreenshotFileName('login-error')
 * // => 'screenshots/login-error_2025-12-26_14-30-45.png'
 * 
 * generateScreenshotFileName('session-error')
 * // => 'screenshots/session-error_2025-12-26_14-32-10.png'
 * ```
 */
export function generateScreenshotFileName(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  return `${pathConfig.screenshotsDir}/${prefix}_${timestamp}.png`;
}

/**
 * Formatea una fecha como string para nombres de archivo.
 * 
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DD_HH-mm-ss
 * 
 * @example
 * ```ts
 * formatDateForFilename(new Date('2025-12-26T14:30:45'))
 * // => '2025-12-26_14-30-45'
 * ```
 */
export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

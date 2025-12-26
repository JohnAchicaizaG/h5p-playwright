/**
 * Tipos y interfaces para el proyecto H5P Playwright.
 *
 * Este módulo centraliza todas las definiciones de tipos para mantener
 * consistencia y type-safety en todo el proyecto.
 */

/**
 * Credenciales de usuario para autenticación en H5P.
 */
export interface H5PCredentials {
  /** Nombre de usuario o email */
  username: string;
  /** Contraseña del usuario */
  password: string;
}

/**
 * Configuración del navegador Playwright.
 */
export interface BrowserConfig {
  /** Si el navegador debe ejecutarse en modo headless */
  headless: boolean;
  /** Timeout por defecto para las operaciones (en milisegundos) */
  defaultTimeout: number;
  /** Timeout para navegación (en milisegundos) */
  navigationTimeout: number;
}

/**
 * Configuración de rutas y archivos del proyecto.
 */
export interface PathConfig {
  /** Ruta donde se guarda el estado de la sesión */
  authFile: string;
  /** Carpeta donde se guardan los screenshots */
  screenshotsDir: string;
}

/**
 * URLs del sitio H5P.
 */
export interface H5PUrls {
  /** URL base del sitio */
  base: string;
  /** URL de la página de contenidos */
  contentTypes: string;
  /** URL de la página de usuario */
  userPage: string;
  /** Patrón de URL para detectar la página de login */
  loginPattern: string;
}

/**
 * Opciones para el proceso de login.
 */
export interface LoginOptions {
  /** Credenciales del usuario */
  credentials: H5PCredentials;
  /** Configuración del navegador */
  browserConfig: BrowserConfig;
  /** Ruta donde guardar el estado de la sesión */
  authFilePath: string;
}

/**
 * Resultado de una operación de login.
 */
export interface LoginResult {
  /** Si el login fue exitoso */
  success: boolean;
  /** URL final después del login */
  url: string;
  /** Mensaje descriptivo del resultado */
  message: string;
  /** Error si ocurrió alguno */
  error?: Error;
}

/**
 * Resultado de una operación de descarga.
 */
export interface DownloadResult {
  /** Si la descarga fue exitosa */
  success: boolean;
  /** Ruta donde se guardó el archivo */
  filePath?: string;
  /** Nombre del archivo descargado */
  fileName?: string;
  /** Mensaje descriptivo del resultado */
  message: string;
  /** Error si ocurrió alguno */
  error?: Error;
}

/**
 * Opciones para descargar contenido H5P.
 */
export interface DownloadOptions {
  /** Nombre del tipo de contenido a descargar */
  contentType: string;
  /** Directorio donde guardar las descargas */
  downloadDir: string;
  /** URL del contenido (opcional, si se conoce directamente) */
  contentUrl?: string;
}

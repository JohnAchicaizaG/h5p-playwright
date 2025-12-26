import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración centralizada del proyecto.
 *
 * Todo en un solo lugar, fácil de mantener y extender.
 */
export const config = {
  /** URLs de H5P.org */
  urls: {
    home: 'https://h5p.org/content-types-and-applications',
    userPage: 'https://h5p.org/user',
    loginPattern: '**/user',
  },

  /** Rutas de archivos */
  paths: {
    authFile: 'h5p-auth.json',
    screenshots: 'screenshots',
    downloads: 'downloads',
  },

  /** Configuración del navegador */
  browser: {
    // Headless por defecto (true), solo false si explícitamente es 'false'
    headless: process.env.HEADLESS === 'false' ? false : true,
  },

  /** Credenciales desde variables de entorno */
  credentials: {
    username: process.env.H5P_USER || '',
    password: process.env.H5P_PASS || '',
  },
} as const;

/**
 * Valida que las credenciales estén configuradas.
 */
export function validateCredentials(): void {
  if (!config.credentials.username || !config.credentials.password) {
    throw new Error('Credenciales no configuradas. Define H5P_USER y H5P_PASS en el archivo .env');
  }
}

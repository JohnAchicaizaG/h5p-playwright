import type { BrowserConfig, H5PUrls, PathConfig } from '../types/index.js';

/**
 * Configuración por defecto del navegador Playwright.
 * 
 * Centraliza todos los valores de configuración relacionados con el navegador,
 * timeouts y comportamiento de las pruebas.
 */
export const browserConfig: BrowserConfig = {
  headless: true,
  defaultTimeout: 30_000,
  navigationTimeout: 30_000,
};

/**
 * URLs del sitio H5P.org.
 * 
 * Centraliza todas las URLs utilizadas en los tests para facilitar
 * el mantenimiento y evitar duplicación.
 */
export const h5pUrls: H5PUrls = {
  base: 'https://h5p.org',
  contentTypes: 'https://h5p.org/content-types-and-applications',
  userPage: 'https://h5p.org/user',
  loginPattern: '**/user',
};

/**
 * Configuración de rutas de archivos del proyecto.
 * 
 * Define las rutas donde se guardan archivos generados durante
 * la ejecución de los tests.
 */
export const pathConfig: PathConfig = {
  authFile: 'h5p-auth.json',
  screenshotsDir: 'screenshots',
};

/**
 * Directorios del proyecto.
 */
export const directories = {
  /** Directorio donde se guardan las descargas */
  downloads: 'downloads',
} as const;

/**
 * Selectores CSS y ARIA para elementos de la página.
 * 
 * Centraliza los selectores para facilitar mantenimiento y hacer
 * los tests más resilientes a cambios en la UI.
 */
export const selectors = {
  /** Selectores para el proceso de login */
  login: {
    loginLink: 'Log in',
    usernameField: /Username or e-mail address/i,
    passwordField: /Password/i,
    submitButton: '#edit-submit',
    logoutLink: 'Log out',
  },
  
  /** Selectores para verificación de sesión */
  session: {
    loggedInBody: 'body.logged-in',
    logoutHref: 'a[href="/user/logout"]',
  },

  /** Selectores para descargas de contenido H5P */
  download: {
    examplesHeading: 'Examples and Downloads',
    trueFalseLink: 'True/False Question',
    h5pIframe: 'iframe.h5p-iframe',
    reuseButton: /^Reuse$/i,
    reuseButtonAria: 'button[aria-label^="Reuse"]',
    downloadLink: /Download/i,
    downloadHref: 'a[href*="download"]',
  },
} as const;

/**
 * Timeouts específicos para diferentes operaciones.
 * 
 * Define timeouts más granulares para operaciones específicas.
 */
export const timeouts = {
  /** Timeout para verificación de elementos */
  elementWait: 10_000,
  /** Timeout para navegación entre páginas */
  navigation: 30_000,
  /** Timeout para verificación de sesión */
  sessionVerification: 15_000,
} as const;

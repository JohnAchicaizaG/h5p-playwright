import { chromium } from 'playwright';
import { H5PLoginPage } from './pages/h5p-login.page.js';
import { config, validateCredentials } from './config.js';
import { logger } from './utils/logger.js';
import fs from 'node:fs';

/**
 * Script para realizar login en H5P.org y guardar la sesión.
 *
 * Requiere variables de entorno H5P_USER y H5P_PASS.
 */
async function main(): Promise<void> {
  try {
    validateCredentials();
    logger.info('Iniciando proceso de login');

    // Crear directorio de screenshots si no existe
    fs.mkdirSync(config.paths.screenshots, { recursive: true });

    // Lanzar navegador
    const browser = await chromium.launch({ headless: config.browser.headless });
    const context = await browser.newContext();
    const page = await context.newPage();

    const loginPage = new H5PLoginPage(page);

    try {
      // Realizar login
      await loginPage.login(config.credentials);
      logger.success('Login exitoso');

      // Guardar sesión
      await loginPage.saveSession(context, config.paths.authFile);
      logger.success(`Sesión guardada en ${config.paths.authFile}`);
    } catch (error) {
      logger.error('Error durante el login', error);
      await loginPage.screenshot(`${config.paths.screenshots}/login-error.png`);
      logger.warn('Screenshot guardado en screenshots/login-error.png');
      process.exit(1);
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error('Error crítico', error);
    process.exit(1);
  }
}

main();

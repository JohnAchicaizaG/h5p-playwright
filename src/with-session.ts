import { chromium } from 'playwright';
import { H5PLoginPage } from './pages/h5p-login.page.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';

/**
 * Script para verificar que la sesión guardada funciona correctamente.
 *
 * Demuestra cómo reutilizar una sesión sin hacer login nuevamente.
 */
async function main(): Promise<void> {
  try {
    logger.info('Verificando sesión guardada');

    // Lanzar navegador con sesión
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      storageState: config.paths.authFile,
    });

    const page = await context.newPage();
    const loginPage = new H5PLoginPage(page);

    try {
      // Navegar a página de usuario
      await page.goto(config.urls.userPage, { waitUntil: 'domcontentloaded' });

      // Verificar sesión activa
      const isActive = await loginPage.verifySession();

      if (isActive) {
        logger.success('Sesión activa y válida');
      } else {
        logger.error('Sesión no válida o expirada');
        process.exit(1);
      }
    } catch (error) {
      logger.error('Error al verificar sesión', error);
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

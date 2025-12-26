import { chromium } from 'playwright';
import { H5PLoginPage } from './pages/h5p-login.page.js';
import { getH5PCredentials, getBrowserConfigFromEnv } from './utils/env.js';
import { browserConfig, pathConfig } from './config/browser.config.js';
import { generateScreenshotFileName } from './utils/screenshot.js';
import { loginLogger } from './utils/logger.js';

/**
 * Script principal para realizar login en H5P.org y guardar la sesión.
 *
 * Este script utiliza el patrón Page Object para mantener el código organizado
 * y reutilizable. Toda la lógica de interacción con la página está encapsulada
 * en la clase H5PLoginPage.
 *
 * @remarks
 * Requiere las variables de entorno H5P_USER y H5P_PASS.
 * Opcionalmente usa HEADLESS para controlar si el navegador es visible.
 *
 * @throws {EnvironmentVariableError} Si faltan variables de entorno requeridas
 * @throws Si el login falla o los elementos no se encuentran
 */
async function main(): Promise<void> {
  const stopTimer = loginLogger.time('⏱️ Proceso completo de login');

  try {
    // Obtener configuración desde variables de entorno
    loginLogger.info('Iniciando script de login');
    const credentials = getH5PCredentials();
    const config = getBrowserConfigFromEnv(browserConfig);
    loginLogger.debug('Configuración cargada', { headless: config.headless });

    // Inicializar navegador y contexto
    loginLogger.debug('Lanzando navegador');
    const browser = await chromium.launch({ headless: config.headless });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Crear instancia del Page Object
    const loginPage = new H5PLoginPage(page);

    try {
      // Ejecutar flujo de login usando el Page Object
      const result = await loginPage.performFullLogin(credentials);

      if (!result.success) {
        throw result.error ?? new Error(result.message);
      }

      loginLogger.info('✅ Login exitoso', { url: result.url });

      // Guardar el estado de la sesión para reutilización futura
      await loginPage.saveSessionState(context, pathConfig.authFile);
      loginLogger.info(`💾 Sesión guardada en ${pathConfig.authFile}`);
    } catch (err) {
      // Manejo de errores con información de debug detallada
      loginLogger.error('❌ Error en el flujo de login', err, {
        url: loginPage.getCurrentUrl(),
      });

      const screenshotPath = generateScreenshotFileName('login-error');
      await loginPage.captureScreenshot(screenshotPath);
      loginLogger.warn(`📸 Screenshot guardado: ${screenshotPath}`);

      process.exitCode = 1;
    } finally {
      await browser.close();
      loginLogger.debug('Navegador cerrado');
    }
  } catch (err) {
    loginLogger.error('❌ Error crítico en el script', err);
    process.exitCode = 1;
  } finally {
    stopTimer();
  }
}

main();

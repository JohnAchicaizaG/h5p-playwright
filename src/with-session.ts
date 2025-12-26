import { chromium } from 'playwright';
import { H5PLoginPage } from './pages/h5p-login.page.js';
import { getBrowserConfigFromEnv } from './utils/env.js';
import { browserConfig, pathConfig, h5pUrls } from './config/browser.config.js';
import { generateScreenshotFileName } from './utils/screenshot.js';
import { sessionLogger } from './utils/logger.js';

/**
 * Script para verificar que la sesión guardada funciona correctamente.
 *
 * Este script demuestra cómo reutilizar una sesión previamente guardada
 * sin necesidad de hacer login nuevamente. Es útil para:
 * - Tests que requieren autenticación
 * - Evitar múltiples logins en diferentes tests
 * - Acelerar la ejecución de pruebas
 *
 * @remarks
 * Requiere que exista el archivo h5p-auth.json generado por login.ts
 *
 * @example
 * ```bash
 * # Primero ejecutar login para generar la sesión
 * npm run login
 * # Luego ejecutar este script
 * npx ts-node src/with-session.ts
 * ```
 */
async function main(): Promise<void> {
  const stopTimer = sessionLogger.time('⏱️ Verificación de sesión');

  try {
    // Obtener configuración del navegador
    sessionLogger.info('Iniciando verificación de sesión');
    const config = getBrowserConfigFromEnv(browserConfig);
    sessionLogger.debug('Configuración cargada', { authFile: pathConfig.authFile });

    // Inicializar navegador con sesión guardada
    sessionLogger.debug('Lanzando navegador con sesión guardada');
    const browser = await chromium.launch({ headless: false });

    // Cargar el estado de sesión guardado
    // Esto restaura cookies, localStorage y sessionStorage del login anterior
    const context = await browser.newContext({
      storageState: pathConfig.authFile,
    });

    const page = await context.newPage();
    const loginPage = new H5PLoginPage(page);

    try {
      // Navegar a una página que requiere autenticación
      // Si la sesión no fuera válida, seríamos redirigidos al login
      sessionLogger.debug('Navegando a página de usuario');
      await page.goto(h5pUrls.userPage, {
        waitUntil: 'domcontentloaded',
      });

      // Verificar que la sesión está activa
      // Usa el método del Page Object que verifica múltiples indicadores
      const isSessionActive = await loginPage.verifySessionActive();

      if (isSessionActive) {
        sessionLogger.info('✅ Sesión reutilizada correctamente', {
          url: loginPage.getCurrentUrl(),
        });
      }
    } catch (err) {
      sessionLogger.error('❌ Error al verificar la sesión', err, {
        url: loginPage.getCurrentUrl(),
      });

      const screenshotPath = generateScreenshotFileName('session-error');
      await loginPage.captureScreenshot(screenshotPath);
      sessionLogger.warn(`📸 Screenshot guardado: ${screenshotPath}`);

      process.exitCode = 1;
    } finally {
      await browser.close();
      sessionLogger.debug('Navegador cerrado');
    }
  } catch (err) {
    sessionLogger.error('❌ Error crítico en el script', err);
    process.exitCode = 1;
  } finally {
    stopTimer();
  }
}

main();

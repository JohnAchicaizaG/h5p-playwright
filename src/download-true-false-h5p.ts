import { chromium } from 'playwright';
import { H5PDownloadPage } from './pages/h5p-download.page.js';
import { getBrowserConfigFromEnv } from './utils/env.js';
import { browserConfig, pathConfig, directories } from './config/browser.config.js';
import { generateScreenshotFileName } from './utils/screenshot.js';
import { logger } from './utils/logger.js';
import path from 'node:path';

const downloadLogger = logger.child('Main');

/**
 * Script para descargar contenido H5P (True/False Question).
 *
 * Este script utiliza el patrón Page Object para mantener el código organizado.
 * Requiere una sesión activa (ejecutar login.ts primero).
 *
 * @remarks
 * Requiere que exista h5p-auth.json generado por login.ts
 *
 * @example
 * ```bash
 * # Primero hacer login
 * npm run login
 * # Luego ejecutar la descarga
 * npm run download
 * ```
 */
async function main(): Promise<void> {
  const stopTimer = downloadLogger.time('⏱️ Proceso completo de descarga');

  try {
    downloadLogger.info('Iniciando script de descarga');

    // Configuración
    const config = getBrowserConfigFromEnv(browserConfig);
    const downloadDir = path.resolve(process.cwd(), directories.downloads);

    downloadLogger.debug('Configuración cargada', {
      headless: config.headless,
      downloadDir,
    });

    // Inicializar navegador con sesión guardada
    downloadLogger.debug('Lanzando navegador con sesión guardada');
    const browser = await chromium.launch({ headless: config.headless });

    const context = await browser.newContext({
      storageState: pathConfig.authFile,
      acceptDownloads: true,
    });

    const page = await context.newPage();
    const downloadPage = new H5PDownloadPage(page);

    try {
      // Ejecutar descarga usando el Page Object
      const result = await downloadPage.downloadContent({
        contentType: 'True/False Question',
        downloadDir,
      });

      if (!result.success) {
        throw result.error ?? new Error(result.message);
      }

      downloadLogger.info('✅ Descarga completada exitosamente', {
        fileName: result.fileName,
        filePath: result.filePath,
      });
    } catch (err) {
      // Manejo de errores con screenshot
      downloadLogger.error('❌ Error en el proceso de descarga', err, {
        url: downloadPage.getCurrentUrl(),
      });

      const screenshotPath = generateScreenshotFileName('download-error');
      await downloadPage.captureScreenshot(screenshotPath);
      downloadLogger.warn(`📸 Screenshot guardado: ${screenshotPath}`);

      process.exitCode = 1;
    } finally {
      await browser.close();
      downloadLogger.debug('Navegador cerrado');
    }
  } catch (err) {
    downloadLogger.error('❌ Error crítico en el script', err);
    process.exitCode = 1;
  } finally {
    stopTimer();
  }
}

main();

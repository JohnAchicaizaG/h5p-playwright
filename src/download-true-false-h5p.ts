import { chromium } from 'playwright';
import { H5PDownloadPage } from './pages/h5p-download.page.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Script para descargar contenido H5P (True/False Question).
 *
 * Requiere sesión activa (ejecutar login.ts primero).
 */
async function main(): Promise<void> {
  try {
    logger.info('Iniciando proceso de descarga');

    // Verificar que existe la sesión
    if (!fs.existsSync(config.paths.authFile)) {
      throw new Error(`No se encontró ${config.paths.authFile}. Ejecuta 'npm run login' primero.`);
    }

    // Crear directorios
    const downloadDir = path.resolve(process.cwd(), config.paths.downloads);
    fs.mkdirSync(downloadDir, { recursive: true });
    fs.mkdirSync(config.paths.screenshots, { recursive: true });

    // Lanzar navegador con sesión guardada
    const browser = await chromium.launch({ headless: config.browser.headless });
    const context = await browser.newContext({
      storageState: config.paths.authFile,
      acceptDownloads: true,
    });

    const page = await context.newPage();
    const downloadPage = new H5PDownloadPage(page);

    try {
      // Descargar contenido
      const result = await downloadPage.downloadContent('True/False Question', downloadDir);
      logger.success('Descarga completada');
      logger.info(`Archivo: ${result.fileName}`);
      logger.info(`Ubicación: ${result.filePath}`);
    } catch (error) {
      logger.error('Error durante la descarga', error);
      await downloadPage.screenshot(`${config.paths.screenshots}/download-error.png`);
      logger.warn('Screenshot guardado en screenshots/download-error.png');
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

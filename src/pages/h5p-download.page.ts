import type { Page, Download, FrameLocator } from 'playwright';
import type { DownloadResult, DownloadOptions } from '../types/index.js';
import { h5pUrls, selectors, timeouts, directories } from '../config/browser.config.js';
import { NavigationError, ElementNotFoundError } from '../utils/errors.js';
import { withRetry, UI_RETRY_OPTIONS } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Logger específico para operaciones de descarga.
 */
const downloadLogger = logger.child('Download');

/**
 * Page Object para descargar contenido H5P.
 *
 * Encapsula toda la lógica para navegar y descargar contenidos desde h5p.org,
 * incluyendo interacción con iframes y manejo de descargas.
 *
 * @example
 * ```ts
 * const downloadPage = new H5PDownloadPage(page);
 * const result = await downloadPage.downloadContent({
 *   contentType: 'True/False Question',
 *   downloadDir: 'downloads'
 * });
 * ```
 */
export class H5PDownloadPage {
  /**
   * Crea una nueva instancia del Page Object.
   *
   * @param page - Instancia de la página de Playwright
   */
  constructor(private readonly page: Page) {}

  /**
   * Navega a la página de ejemplos y descargas de H5P.
   *
   * @returns Promise que se resuelve cuando la navegación está completa
   * @throws {NavigationError} Si la navegación falla
   */
  async navigateToExamplesPage(): Promise<void> {
    downloadLogger.debug('Navegando a página de ejemplos y descargas');

    await withRetry(
      async () => {
        await this.page.goto(h5pUrls.contentTypes, {
          waitUntil: 'domcontentloaded',
        });
      },
      {
        ...UI_RETRY_OPTIONS,
        onRetry: (error, attempt, delay) => {
          downloadLogger.warn(`Reintentando navegación (intento ${attempt})`, {
            error: error.message,
            nextRetryIn: delay,
          });
        },
      },
      'Navegación a página de ejemplos'
    ).catch((error) => {
      throw new NavigationError(h5pUrls.contentTypes, this.page.url(), error as Error);
    });

    // Esperar a que cargue la sección de ejemplos
    await this.page
      .getByRole('heading', { name: selectors.download.examplesHeading })
      .waitFor({ timeout: timeouts.elementWait })
      .catch((error) => {
        throw new ElementNotFoundError(
          selectors.download.examplesHeading,
          timeouts.elementWait,
          this.page.url()
        );
      });

    downloadLogger.info('Navegación exitosa a página de ejemplos');
  }

  /**
   * Navega a una página de contenido específico.
   *
   * @param contentName - Nombre del contenido a buscar
   * @param urlPattern - Patrón de URL esperado
   * @returns Promise que se resuelve cuando la navegación está completa
   * @throws {ElementNotFoundError} Si no se encuentra el enlace del contenido
   */
  async navigateToContent(contentName: string, urlPattern: string): Promise<void> {
    downloadLogger.debug('Navegando a contenido', { contentName, urlPattern });

    const contentLink = this.page.getByRole('link', { name: contentName });

    // Hacer scroll al enlace si es necesario
    await contentLink.scrollIntoViewIfNeeded().catch(() => {
      downloadLogger.warn('No se pudo hacer scroll al enlace, intentando de todas formas');
    });

    await Promise.all([
      this.page.waitForURL(urlPattern, { timeout: timeouts.navigation }),
      contentLink.click(),
    ]).catch((error) => {
      throw new NavigationError(`Contenido: ${contentName}`, this.page.url(), error as Error);
    });

    downloadLogger.info('Navegación exitosa al contenido', { contentName });
  }

  /**
   * Obtiene el iframe de H5P en la página.
   *
   * @returns FrameLocator del iframe H5P
   */
  getH5PIframe(): FrameLocator {
    return this.page.frameLocator(selectors.download.h5pIframe);
  }

  /**
   * Hace clic en el botón "Reuse" dentro del iframe H5P.
   *
   * @returns Promise que se resuelve cuando se hizo clic exitosamente
   * @throws {ElementNotFoundError} Si no se encuentra el botón
   */
  async clickReuseButton(): Promise<void> {
    downloadLogger.debug('Buscando botón Reuse en iframe');

    const frame = this.getH5PIframe();

    const reuseBtn = frame
      .getByRole('button', { name: selectors.download.reuseButton })
      .or(frame.locator(selectors.download.reuseButtonAria));

    await reuseBtn
      .first()
      .waitFor({ timeout: timeouts.navigation })
      .catch((error) => {
        throw new ElementNotFoundError('Botón Reuse', timeouts.navigation, this.page.url());
      });

    await reuseBtn.first().click();
    downloadLogger.info('Botón Reuse clickeado exitosamente');
  }

  /**
   * Descarga el archivo H5P haciendo clic en el botón/enlace de descarga.
   *
   * @param downloadDir - Directorio donde guardar el archivo
   * @returns Promise con la información de la descarga
   * @throws {ElementNotFoundError} Si no se encuentra el botón de descarga
   */
  async downloadFile(downloadDir: string): Promise<{ filePath: string; fileName: string }> {
    downloadLogger.debug('Iniciando descarga de archivo', { downloadDir });

    // Asegurar que existe el directorio de descargas
    fs.mkdirSync(downloadDir, { recursive: true });

    const frame = this.getH5PIframe();

    // Buscar el trigger de descarga (puede ser link o botón)
    const downloadTrigger = frame
      .getByRole('link', { name: selectors.download.downloadLink })
      .or(frame.getByRole('button', { name: selectors.download.downloadLink }))
      .or(frame.locator(selectors.download.downloadHref));

    await downloadTrigger
      .first()
      .waitFor({ timeout: timeouts.navigation })
      .catch((error) => {
        throw new ElementNotFoundError(
          'Botón/enlace de descarga',
          timeouts.navigation,
          this.page.url()
        );
      });

    // Iniciar descarga
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: timeouts.navigation }),
      downloadTrigger.first().click(),
    ]);

    const fileName = download.suggestedFilename() || 'content.h5p';
    const filePath = path.join(downloadDir, fileName);

    await download.saveAs(filePath);

    downloadLogger.info('Descarga completada', { fileName, filePath });

    return { filePath, fileName };
  }

  /**
   * Captura un screenshot de la página actual.
   *
   * @param filePath - Ruta donde guardar el screenshot
   * @returns Promise que se resuelve cuando el screenshot se ha guardado
   */
  async captureScreenshot(filePath: string): Promise<void> {
    await this.page.screenshot({ path: filePath, fullPage: true });
  }

  /**
   * Obtiene la URL actual de la página.
   *
   * @returns La URL actual
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Descarga un contenido H5P completo.
   *
   * Orquesta todos los pasos necesarios: navegación, interacción con iframe,
   * y descarga del archivo.
   *
   * @param options - Opciones de descarga
   * @returns Resultado de la operación
   */
  async downloadContent(options: DownloadOptions): Promise<DownloadResult> {
    const stopTimer = downloadLogger.time(`Descarga de ${options.contentType}`);
    downloadLogger.group(`Iniciando descarga: ${options.contentType}`);

    try {
      await this.navigateToExamplesPage();

      // Para True/False, sabemos el patrón de URL
      if (options.contentType === 'True/False Question') {
        await this.navigateToContent(options.contentType, '**/true-false');
      } else {
        // Para otros tipos, intentar navegación genérica
        await this.navigateToContent(options.contentType, '**/*');
      }

      await this.clickReuseButton();

      const { filePath, fileName } = await this.downloadFile(options.downloadDir);

      const result: DownloadResult = {
        success: true,
        filePath,
        fileName,
        message: 'Descarga completada exitosamente',
      };

      downloadLogger.info('Descarga finalizada', { fileName, filePath });
      downloadLogger.groupEnd();
      stopTimer();

      return result;
    } catch (error) {
      const result: DownloadResult = {
        success: false,
        message: 'Error durante la descarga',
        error: error instanceof Error ? error : new Error(String(error)),
      };

      downloadLogger.error('Descarga fallida', error, { contentType: options.contentType });
      downloadLogger.groupEnd();
      stopTimer();

      return result;
    }
  }
}

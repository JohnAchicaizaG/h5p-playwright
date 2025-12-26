import type { Page } from 'playwright';
import { config } from '../config.js';

/**
 * Resultado de descarga.
 */
export interface DownloadResult {
  fileName: string;
  filePath: string;
}

/**
 * Page Object para descargar contenido H5P.
 *
 * Encapsula la navegación y descarga de contenidos desde h5p.org.
 */
export class H5PDownloadPage {
  constructor(private readonly page: Page) {}

  /**
   * Descarga un contenido H5P específico.
   */
  async downloadContent(contentName: string, downloadDir: string): Promise<DownloadResult> {
    // Navegar a página de ejemplos (timeout aumentado para sitios lentos)
    await this.page.goto(config.urls.home, {
      waitUntil: 'domcontentloaded',
      timeout: 60000 // 60 segundos (vs 30 por defecto)
    });
    await this.page.getByRole('heading', { name: 'Examples and Downloads' }).waitFor();

    // Navegar al contenido específico
    await this.page.getByRole('link', { name: contentName }).click();
    await this.page.waitForLoadState('domcontentloaded');

    // Interactuar con el iframe H5P
    const frame = this.page.frameLocator('iframe.h5p-iframe');

    // Clic en botón Reuse
    const reuseBtn = frame
      .getByRole('button', { name: /^Reuse$/i })
      .or(frame.locator('button[aria-label^="Reuse"]'));
    await reuseBtn.first().waitFor();
    await reuseBtn.first().click();

    // Clic en Download y esperar descarga
    const downloadBtn = frame
      .getByRole('link', { name: /Download/i })
      .or(frame.getByRole('button', { name: /Download/i }))
      .or(frame.locator('a[href*="download"]'));

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      downloadBtn.first().click(),
    ]);

    // Guardar archivo
    const fileName = download.suggestedFilename() || 'content.h5p';
    const filePath = `${downloadDir}/${fileName}`;
    await download.saveAs(filePath);

    return { fileName, filePath };
  }

  /**
   * Captura screenshot de la página actual.
   */
  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }
}

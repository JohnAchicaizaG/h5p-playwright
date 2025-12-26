import type { Page, BrowserContext } from 'playwright';
import { config } from '../config.js';

/**
 * Credenciales de usuario H5P.
 */
export interface H5PCredentials {
  username: string;
  password: string;
}

/**
 * Page Object para login en H5P.org.
 *
 * Encapsula la lógica de autenticación manteniendo el código limpio y reutilizable.
 */
export class H5PLoginPage {
  constructor(private readonly page: Page) {}

  /**
   * Realiza el login completo en H5P.org.
   */
  async login(credentials: H5PCredentials): Promise<void> {
    // Navegar a la página principal (timeout aumentado para sitios lentos)
    await this.page.goto(config.urls.home, {
      waitUntil: 'domcontentloaded',
      timeout: 60000 // 60 segundos
    });

    // Hacer clic en "Log in"
    await Promise.all([
      this.page.waitForURL(config.urls.loginPattern, { timeout: 60000 }),
      this.page.getByRole('link', { name: 'Log in' }).click(),
    ]);

    // Llenar formulario
    await this.page.getByLabel(/Username or e-mail address/i).fill(credentials.username);
    await this.page.getByLabel(/Password/i).fill(credentials.password);

    // Enviar y esperar navegación
    await Promise.all([
      this.page.waitForLoadState('networkidle', { timeout: 60000 }),
      this.page.locator('#edit-submit').click(),
    ]);

    // Verificar login exitoso (timeout aumentado)
    await this.page.getByRole('link', { name: 'Log out' }).waitFor({ timeout: 60000 });
  }

  /**
   * Guarda el estado de sesión en un archivo.
   */
  async saveSession(context: BrowserContext, path: string): Promise<void> {
    await context.storageState({ path });
  }

  /**
   * Verifica que la sesión esté activa.
   */
  async verifySession(): Promise<boolean> {
    try {
      await this.page.getByRole('link', { name: 'Log out' }).waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Captura screenshot de la página actual.
   */
  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }
}

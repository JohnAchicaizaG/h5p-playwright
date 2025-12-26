import type { Page, BrowserContext } from 'playwright';
import type { H5PCredentials, LoginResult } from '../types/index.js';
import { h5pUrls, selectors, timeouts } from '../config/browser.config.js';
import {
  LoginError,
  SessionVerificationError,
  NavigationError,
  ElementNotFoundError,
  SessionStateError,
} from '../utils/errors.js';
import { withRetry, UI_RETRY_OPTIONS } from '../utils/retry.js';
import { loginLogger, navigationLogger, sessionLogger } from '../utils/logger.js';

/**
 * Page Object que encapsula toda la lógica de interacción con la página de login de H5P.
 *
 * Este patrón (Page Object Pattern) centraliza los selectores y acciones de la página,
 * haciendo el código más mantenible y reutilizable.
 *
 * @example
 * ```ts
 * const loginPage = new H5PLoginPage(page);
 * await loginPage.navigateToSite();
 * await loginPage.performLogin(credentials);
 * const isLoggedIn = await loginPage.verifyLoginSuccess();
 * ```
 */
export class H5PLoginPage {
  /**
   * Crea una nueva instancia del Page Object.
   *
   * @param page - Instancia de la página de Playwright
   */
  constructor(private readonly page: Page) {}

  /**
   * Navega a la página principal de H5P.
   *
   * Usa 'domcontentloaded' para no esperar a que todos los recursos
   * (imágenes, CSS, etc.) se carguen completamente.
   * Incluye retry logic para manejar fallos de red temporales.
   *
   * @returns Promise que se resuelve cuando la página está cargada
   * @throws {NavigationError} Si la navegación falla después de reintentos
   */
  async navigateToSite(): Promise<void> {
    navigationLogger.debug('Navegando a página principal de H5P');

    await withRetry(
      async () => {
        await this.page.goto(h5pUrls.contentTypes, {
          waitUntil: 'domcontentloaded',
        });
      },
      {
        ...UI_RETRY_OPTIONS,
        onRetry: (error, attempt, delay) => {
          navigationLogger.warn(`Reintentando navegación (intento ${attempt})`, {
            error: error.message,
            nextRetryIn: delay,
          });
        },
      },
      'Navegación a página principal'
    ).catch((error) => {
      throw new NavigationError(h5pUrls.contentTypes, this.page.url(), error as Error);
    });

    navigationLogger.info('Navegación exitosa a página principal');
  }

  /**
   * Hace clic en el enlace "Log in" y espera la navegación a la página de login.
   *
   * Promise.all asegura que el clic y la espera de navegación se coordinen
   * correctamente, evitando race conditions.
   * Incluye retry logic y manejo de errores mejorado.
   *
   * @returns Promise que se resuelve cuando la navegación está completa
   * @throws {NavigationError} Si la navegación a login falla
   */
  async navigateToLoginPage(): Promise<void> {
    navigationLogger.debug('Navegando a página de login');

    await withRetry(
      async () => {
        await Promise.all([
          this.page.waitForURL(h5pUrls.loginPattern, { timeout: timeouts.navigation }),
          this.page.getByRole('link', { name: selectors.login.loginLink }).click(),
        ]);
      },
      {
        ...UI_RETRY_OPTIONS,
        onRetry: (error, attempt, delay) => {
          navigationLogger.warn(`Reintentando navegación a login (intento ${attempt})`, {
            error: error.message,
            nextRetryIn: delay,
          });
        },
      },
      'Navegación a página de login'
    ).catch((error) => {
      throw new NavigationError(h5pUrls.loginPattern, this.page.url(), error as Error);
    });

    navigationLogger.info('Navegación exitosa a página de login');
  }

  /**
   * Completa el formulario de login con las credenciales proporcionadas.
   *
   * Usa getByLabel para localizar los campos de forma semántica y resistente
   * a cambios en el HTML. Las expresiones regulares permiten variaciones
   * en el texto de los labels.
   *
   * @param credentials - Credenciales del usuario
   * @returns Promise que se resuelve cuando el formulario está completado
   * @throws {ElementNotFoundError} Si los campos del formulario no se encuentran
   */
  async fillLoginForm(credentials: H5PCredentials): Promise<void> {
    loginLogger.debug('Completando formulario de login', { username: credentials.username });

    try {
      await this.page.getByLabel(selectors.login.usernameField).fill(credentials.username);
      await this.page.getByLabel(selectors.login.passwordField).fill(credentials.password);

      loginLogger.debug('Formulario completado exitosamente');
    } catch (error) {
      throw new ElementNotFoundError(
        'Campos de formulario de login',
        timeouts.elementWait,
        this.page.url()
      );
    }
  }

  /**
   * Envía el formulario de login y espera a que se complete la navegación.
   *
   * Espera 'networkidle' para asegurar que todas las peticiones de red
   * relacionadas con el login se completen antes de continuar.
   * Incluye retry logic para manejar fallos temporales.
   *
   * @returns Promise que se resuelve cuando el login se ha procesado
   * @throws {LoginError} Si el envío del formulario falla
   */
  async submitLoginForm(): Promise<void> {
    loginLogger.debug('Enviando formulario de login');

    await withRetry(
      async () => {
        await Promise.all([
          this.page.waitForLoadState('networkidle', { timeout: timeouts.navigation }),
          this.page.locator(selectors.login.submitButton).click(),
        ]);
      },
      {
        ...UI_RETRY_OPTIONS,
        maxAttempts: 2, // Menos reintentos para submit
        onRetry: (error, attempt) => {
          loginLogger.warn(`Reintentando envío de formulario (intento ${attempt})`, {
            error: error.message,
          });
        },
      },
      'Envío de formulario de login'
    ).catch((error) => {
      throw new LoginError('Error al enviar formulario', this.page.url(), error as Error);
    });

    loginLogger.info('Formulario enviado exitosamente');
  }

  /**
   * Verifica que el login fue exitoso buscando el enlace "Log out".
   *
   * Si el enlace "Log out" está presente, significa que el usuario
   * está autenticado exitosamente.
   *
   * @returns Promise que se resuelve con true si el login fue exitoso
   * @throws {LoginError} Si la verificación falla
   */
  async verifyLoginSuccess(): Promise<boolean> {
    loginLogger.debug('Verificando login exitoso');

    try {
      await this.page
        .getByRole('link', { name: selectors.login.logoutLink })
        .waitFor({ timeout: timeouts.elementWait });

      loginLogger.info('Login verificado exitosamente');
      return true;
    } catch (error) {
      throw new LoginError('No se encontró el enlace de logout', this.page.url(), error as Error);
    }
  }

  /**
   * Verifica que la sesión está activa usando la clase CSS de Drupal.
   *
   * Drupal añade la clase 'logged-in' al body cuando el usuario está autenticado.
   * Este método es más robusto que verificar elementos del menú.
   *
   * @returns Promise que se resuelve con true si la sesión está activa
   * @throws {SessionVerificationError} Si la verificación falla
   */
  async verifySessionActive(): Promise<boolean> {
    sessionLogger.debug('Verificando sesión activa');

    try {
      await this.page.locator(selectors.session.loggedInBody).waitFor({
        timeout: timeouts.sessionVerification,
      });

      const logoutLink = this.page.locator(selectors.session.logoutHref);
      await logoutLink.waitFor({
        state: 'attached',
        timeout: timeouts.sessionVerification,
      });

      sessionLogger.info('Sesión verificada como activa');
      return true;
    } catch (error) {
      throw new SessionVerificationError('No se pudo verificar la sesión activa', this.page.url());
    }
  }

  /**
   * Guarda el estado de la sesión en un archivo JSON.
   *
   * El estado incluye cookies, localStorage y sessionStorage,
   * permitiendo reutilizar la sesión sin hacer login nuevamente.
   *
   * @param context - Contexto del navegador de Playwright
   * @param path - Ruta donde guardar el archivo de estado
   * @returns Promise que se resuelve cuando el estado se ha guardado
   * @throws {SessionStateError} Si falla el guardado
   */
  async saveSessionState(context: BrowserContext, path: string): Promise<void> {
    sessionLogger.debug('Guardando estado de sesión', { path });

    try {
      await context.storageState({ path });
      sessionLogger.info('Estado de sesión guardado exitosamente', { path });
    } catch (error) {
      throw new SessionStateError('save', path, error as Error);
    }
  }

  /**
   * Captura un screenshot de la página actual.
   *
   * Útil para debugging cuando ocurren errores durante el proceso de login.
   *
   * @param path - Ruta donde guardar el screenshot
   * @returns Promise que se resuelve cuando el screenshot se ha guardado
   */
  async captureScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
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
   * Realiza el flujo completo de login.
   *
   * Este método orquesta todos los pasos necesarios para realizar un login
   * exitoso, desde la navegación inicial hasta la verificación.
   * Incluye logging detallado y manejo de errores profesional.
   *
   * @param credentials - Credenciales del usuario
   * @returns Resultado del login con información de éxito o error
   */
  async performFullLogin(credentials: H5PCredentials): Promise<LoginResult> {
    const stopTimer = loginLogger.time('Flujo completo de login');
    loginLogger.group('Iniciando proceso de login');

    try {
      await this.navigateToSite();
      await this.navigateToLoginPage();
      await this.fillLoginForm(credentials);
      await this.submitLoginForm();
      await this.verifyLoginSuccess();

      const result: LoginResult = {
        success: true,
        url: this.getCurrentUrl(),
        message: 'Login exitoso',
      };

      loginLogger.info('Login completado exitosamente', { url: result.url });
      loginLogger.groupEnd();
      stopTimer();

      return result;
    } catch (error) {
      const result: LoginResult = {
        success: false,
        url: this.getCurrentUrl(),
        message: 'Error durante el login',
        error: error instanceof Error ? error : new Error(String(error)),
      };

      loginLogger.error('Login fallido', error, { url: result.url });
      loginLogger.groupEnd();
      stopTimer();

      return result;
    }
  }
}

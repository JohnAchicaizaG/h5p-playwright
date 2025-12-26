# H5P Playwright Testing

Proyecto de automatización de pruebas para H5P.org usando Playwright y TypeScript.

## 📋 Características

- ✅ **Page Object Pattern**: Arquitectura mantenible y escalable
- ✅ **TypeScript**: Type-safety completo con tipos e interfaces
- ✅ **Gestión de Sesión**: Login una vez, reutiliza la sesión en múltiples tests
- ✅ **Configuración Centralizada**: Todas las configuraciones en un solo lugar
- ✅ **Manejo de Errores Robusto**: Custom error classes con contexto detallado
- ✅ **Retry Logic**: Reintentos automáticos con exponential backoff
- ✅ **Logger Estructurado**: Logging profesional con niveles y colores
- ✅ **Screenshots Automáticos**: Captura automática en caso de fallo
- ✅ **Documentación TSDoc**: Código completamente documentado
- ✅ **Calidad de Código**: ESLint y Prettier configurados con reglas estrictas

## 🏗️ Arquitectura del Proyecto

```
h5p-playwright/
├── src/
│   ├── config/          # Configuraciones centralizadas
│   │   └── browser.config.ts
│   ├── pages/           # Page Objects (patrón de diseño)
│   │   └── h5p-login.page.ts
│   ├── types/           # Definiciones de tipos TypeScript
│   │   └── index.ts
│   ├── utils/           # Utilidades
│   │   ├── env.ts       # Manejo de variables de entorno
│   │   ├── errors.ts    # Custom error classes
│   │   ├── logger.ts    # Logger estructurado
│   │   └── retry.ts     # Lógica de reintentos
│   ├── login.ts         # Script principal de login
│   └── with-session.ts  # Script para verificar sesión
├── .env                 # Variables de entorno (no versionado)
├── .env.example         # Ejemplo de variables requeridas
├── .eslintrc.json       # Configuración de ESLint
├── .prettierrc          # Configuración de Prettier
├── h5p-auth.json        # Sesión guardada (generado)
└── package.json
```

## 🚀 Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Instala los navegadores de Playwright:

```bash
npx playwright install
```

4. Configura las variables de entorno:

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# Credenciales de H5P.org
H5P_USER=tu-usuario@ejemplo.com
H5P_PASS=tu-contraseña

# Configuración del navegador (opcional)
HEADLESS=false  # true = sin interfaz gráfica, false = visible
```

## 📖 Uso

### Login y Guardar Sesión

Ejecuta el script de login para autenticarte y guardar la sesión:

```bash
npm run login
```

Este comando:
1. Abre el navegador (si `HEADLESS=false`)
2. Navega a H5P.org
3. Realiza el login con tus credenciales
4. Guarda la sesión en `h5p-auth.json`

### Reutilizar Sesión Guardada

Para verificar que la sesión funciona:

```bash
npm run verify-session
```

### Verificación de Calidad del Código

**Verificar tipos TypeScript:**
```bash
npm run type-check
```

**Ejecutar linter:**
```bash
npm run lint
```

**Formatear código:**
```bash
npm run format
```

**Verificar todo (types, lint, format):**
```bash
npm run quality
```

**Auto-corregir problemas:**
```bash
npm run quality:fix
```

## 🏛️ Patrones de Diseño

### Page Object Pattern

La lógica de interacción con las páginas está encapsulada en clases dedicadas:

```typescript
import { H5PLoginPage } from './pages/h5p-login.page.js';

const loginPage = new H5PLoginPage(page);
await loginPage.performFullLogin(credentials);
```

**Beneficios:**
- Código reutilizable
- Fácil mantenimiento
- Selectores centralizados
- Tests más legibles

### Configuración Centralizada

Todas las configuraciones están en `src/config/browser.config.ts`:

```typescript
export const browserConfig: BrowserConfig = {
  headless: true,
  defaultTimeout: 30_000,
  navigationTimeout: 30_000,
};
```

### Manejo de Variables de Entorno

Utilidades type-safe para variables de entorno:

```typescript
import { getH5PCredentials } from './utils/env.js';

const credentials = getH5PCredentials();
```

## 📝 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Login | `npm run login` | Ejecuta el flujo de login y guarda sesión |
| Verificar Sesión | `npm run verify-session` | Verifica que la sesión guardada funciona |
| Type Check | `npm run type-check` | Verifica tipos TypeScript sin compilar |
| Lint | `npm run lint` | Ejecuta ESLint para encontrar problemas |
| Lint Fix | `npm run lint:fix` | Auto-corrige problemas de ESLint |
| Format | `npm run format` | Formatea código con Prettier |
| Format Check | `npm run format:check` | Verifica formato sin modificar |
| Quality | `npm run quality` | Ejecuta todas las verificaciones |
| Quality Fix | `npm run quality:fix` | Auto-corrige formato y lint |

## 🛠️ Desarrollo

### Manejo de Errores

El proyecto usa custom error classes para diferentes escenarios:

```typescript
import { LoginError, NavigationError } from './utils/errors.js';

try {
  await login();
} catch (error) {
  if (error instanceof LoginError) {
    // Manejo específico para errores de login
  }
}
```

### Retry Logic

Operaciones propensas a fallar incluyen reintentos automáticos:

```typescript
import { withRetry, UI_RETRY_OPTIONS } from './utils/retry.js';

await withRetry(
  async () => await page.click('#button'),
  UI_RETRY_OPTIONS,
  'Click en botón'
);
```

### Logging

Usa el logger estructurado en lugar de console.log:

```typescript
import { logger } from './utils/logger.js';

logger.info('Operación completada', { duration: 1000 });
logger.error('Error encontrado', error, { context: 'Login' });
```

### Agregar Nuevas Páginas

1. Crea un nuevo Page Object en `src/pages/`:

```typescript
export class MiNuevaPagina {
  constructor(private readonly page: Page) {}
  
  async miMetodo(): Promise<void> {
    // Implementación
  }
}
```

2. Usa el Page Object en tus scripts:

```typescript
const miPagina = new MiNuevaPagina(page);
await miPagina.miMetodo();
```

### Configurar Timeouts

Edita `src/config/browser.config.ts`:

```typescript
export const timeouts = {
  elementWait: 10_000,
  navigation: 30_000,
  sessionVerification: 15_000,
};
```

## 🐛 Debugging

### Modo Visual

Ejecuta con el navegador visible:

```bash
HEADLESS=false npm run login
```

### Screenshots de Error

En caso de fallo, se guarda automáticamente un screenshot en `error.png`.

## 📚 Documentación del Código

Todo el código está documentado con TSDoc. Para ver la documentación:

1. Pasa el cursor sobre cualquier función/clase en VS Code
2. O lee los comentarios directamente en el código

## 🔒 Seguridad

⚠️ **Importante:** 
- Nunca commits el archivo `.env` con credenciales reales
- El archivo `h5p-auth.json` contiene sesión activa, no lo compartas
- Agrega ambos archivos a `.gitignore`

## 📦 Dependencias

**Producción:**
- **playwright**: Framework de automatización de navegadores
- **dotenv**: Carga variables de entorno desde `.env`

**Desarrollo:**
- **typescript**: Superset de JavaScript con tipos estáticos
- **ts-node**: Ejecuta TypeScript directamente sin compilar
- **eslint**: Herramienta de linting para JavaScript/TypeScript
- **@typescript-eslint**: Plugin de ESLint para TypeScript
- **prettier**: Formateador de código automático
- **@types/node**: Definiciones de tipos para Node.js


## 📄 Licencia

ISC

# Tips de Uso

## 🚀 Inicio Rápido

### Primera vez

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar credenciales
cp .env.example .env
# Edita .env con tus credenciales

# 3. Hacer login
npm run login

# 4. Descargar contenido
npm run download
```

### Uso diario

```bash
# Descargar (usa sesión guardada)
npm run download

# Si la sesión expiró
npm run login
```

## 🔧 Configuración

### Ver el navegador (debugging)

```env
# .env
HEADLESS=false
```

### Ver logs de debug

```bash
DEBUG=1 npm run download
```

## 📝 Personalizar Descargas

### Descargar otro tipo de contenido

Edita [src/download-true-false-h5p.ts](src/download-true-false-h5p.ts#L32):

```typescript
// Cambia 'True/False Question' por otro contenido
const result = await downloadPage.downloadContent(
  'Dialog Cards', // ← Cambia esto
  downloadDir
);
```

Contenidos disponibles:

- `True/False Question`
- `Dialog Cards`
- `Multiple Choice`
- `Fill in the Blanks`
- `Interactive Video`
- ... y más

## 🐛 Troubleshooting

### Error: "Credenciales no configuradas"

```bash
# Asegúrate de tener .env con:
H5P_USER=tu_usuario
H5P_PASS=tu_password
```

### Error: "No se encontró h5p-auth.json"

```bash
# Ejecuta login primero
npm run login
```

### El selector no funciona

```typescript
// Opción 1: Buscar por texto
await page.getByRole('button', { name: 'Download' });

// Opción 2: Usar RegEx
await page.getByRole('button', { name: /download/i });

// Opción 3: CSS selector
await page.locator('button.download-btn');
```

### La descarga no inicia

```typescript
// Asegúrate de aceptar descargas
const context = await browser.newContext({
  acceptDownloads: true, // ← Importante
});
```

## 🎨 Mejorar el Logger

### Agregar nuevo nivel

```typescript
// src/utils/logger.ts
export const logger = {
  // ... existentes

  verbose(message: string, ...args: unknown[]): void {
    if (process.env.VERBOSE) {
      console.log(`[VERBOSE] ${message}`, ...args);
    }
  },
};
```

### Guardar logs en archivo

```typescript
import fs from 'node:fs';

const logFile = 'logs/app.log';

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFile, line);
  console.log(message);
}
```

## 📦 Extender Funcionalidad

### Nuevo Page Object

```typescript
// src/pages/h5p-search.page.ts
import type { Page } from 'playwright';

export class H5PSearchPage {
  constructor(private readonly page: Page) {}

  async search(query: string): Promise<string[]> {
    await this.page.goto('https://h5p.org/search');
    await this.page.fill('#search-input', query);
    await this.page.click('#search-btn');

    const results = await this.page.locator('.result-item').allTextContents();

    return results;
  }
}
```

### Nuevo Script

```typescript
// src/search.ts
import { chromium } from 'playwright';
import { H5PSearchPage } from './pages/h5p-search.page.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: config.browser.headless });
  const page = await browser.newPage();

  const searchPage = new H5PSearchPage(page);
  const results = await searchPage.search('interactive');

  logger.info(`Encontrados ${results.length} resultados`);
  results.forEach((r, i) => logger.info(`${i + 1}. ${r}`));

  await browser.close();
}

main();
```

### Agregar al package.json

```json
{
  "scripts": {
    "search": "tsx src/search.ts"
  }
}
```

## 🧪 Testing

### Agregar tests (opcional)

```bash
npm install --save-dev vitest @playwright/test
```

```typescript
// tests/login.test.ts
import { test, expect } from '@playwright/test';
import { H5PLoginPage } from '../src/pages/h5p-login.page';
import { config } from '../src/config';

test('login correcto', async ({ page }) => {
  const loginPage = new H5PLoginPage(page);

  await loginPage.login(config.credentials);
  const isActive = await loginPage.verifySession();

  expect(isActive).toBe(true);
});
```

## 💾 Guardar Múltiples Sesiones

```typescript
// Para diferentes usuarios
await loginPage.saveSession(context, 'sessions/user1.json');
await loginPage.saveSession(context, 'sessions/user2.json');

// Cargar sesión específica
const context = await browser.newContext({
  storageState: 'sessions/user1.json',
});
```

## 🔒 Seguridad

### No subir credenciales

```bash
# .gitignore ya tiene:
.env
h5p-auth.json
sessions/
```

### Usar variables de entorno en CI/CD

```yaml
# .github/workflows/test.yml
env:
  H5P_USER: ${{ secrets.H5P_USER }}
  H5P_PASS: ${{ secrets.H5P_PASS }}
```

## 📊 Métricas y Monitoreo

### Medir tiempo de ejecución

```typescript
const start = Date.now();

await downloadPage.downloadContent('True/False Question', downloadDir);

const duration = Date.now() - start;
logger.info(`Completado en ${duration}ms`);
```

### Contador de descargas

```typescript
let downloadCount = 0;

for (const content of contents) {
  await downloadPage.downloadContent(content, downloadDir);
  downloadCount++;
  logger.success(`Descargados: ${downloadCount}/${contents.length}`);
}
```

## 🎯 Mejores Prácticas

1. ✅ **Ejecuta `npm run type-check`** antes de commit
2. ✅ **Usa `npm run format`** para mantener estilo consistente
3. ✅ **Documenta** solo lo no-obvio
4. ✅ **Mantén los scripts** cortos y enfocados
5. ✅ **Un Page Object** por página o sección
6. ✅ **Config en config.ts**, no hardcodeado
7. ✅ **Manejo de errores** con try/catch descriptivos

## 📖 Recursos

- [Playwright Docs](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Page Object Pattern](https://playwright.dev/docs/pom)

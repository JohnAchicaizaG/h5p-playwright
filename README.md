# H5P Playwright Automation

Automatización limpia y profesional para H5P.org usando Playwright y TypeScript.

## 🎯 Filosofía del Proyecto

Este proyecto demuestra cómo escribir código de automatización **profesional pero pragmático**:

- ✅ **Sin sobre-ingeniería**: Solo lo necesario, nada más
- ✅ **Page Object Pattern**: Código organizado y reutilizable
- ✅ **TypeScript**: Type-safety sin complejidad innecesaria
- ✅ **Fácil de extender**: Estructura clara para agregar nuevos scripts
- ✅ **Mantenible**: Documentación justa, código auto-explicativo

## 📁 Estructura del Proyecto

```
h5p-playwright/
├── src/
│   ├── pages/                    # Page Objects
│   │   ├── h5p-login.page.ts     # Lógica de login
│   │   └── h5p-download.page.ts  # Lógica de descarga
│   ├── utils/
│   │   └── logger.ts             # Logger simple con colores
│   ├── config.ts                 # Configuración centralizada
│   ├── login.ts                  # Script de login
│   ├── download-true-false-h5p.ts # Script de descarga
│   └── with-session.ts           # Verificación de sesión
├── downloads/                    # Archivos descargados
├── screenshots/                  # Screenshots de errores
├── .env                          # Variables de entorno (crear)
└── h5p-auth.json                 # Sesión guardada (generado)
```

## 🚀 Uso Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar credenciales

Crea un archivo `.env`:

```env
H5P_USER=tu_usuario
H5P_PASS=tu_password
HEADLESS=true  # false para ver el navegador
```

### 3. Ejecutar scripts

```bash
# Login y guardar sesión
npm run login

# Descargar contenido (requiere login previo)
npm run download

# Verificar sesión guardada
npm run verify-session
```

## 🐳 Uso con Docker

¿Prefieres no instalar Node.js y dependencias? Usa Docker para ejecutar todo en un contenedor aislado.

### Opción 1: Scripts helpers (más fácil)

```bash
# Build de la imagen
./docker/docker-build.sh

# Login
./docker/docker-login.sh

# Download
./docker/docker-download.sh

# Verificar sesión
./docker/docker-verify.sh
```

### Opción 2: Docker Compose directo

```bash
# Build
docker compose build

# Login
docker compose run --rm h5p npm run login

# Download
docker compose run --rm h5p npm run download
```

### Opción 3: npm scripts

```bash
npm run docker:build
npm run docker:login
npm run docker:download
npm run docker:verify
```

📖 **Documentación completa:** [docker/README-Docker.md](docker/README-Docker.md)

## 🏗️ Arquitectura

### Page Objects

Los Page Objects encapsulan la interacción con las páginas, manteniendo el código DRY:

```typescript
// src/pages/h5p-login.page.ts
export class H5PLoginPage {
  async login(credentials: H5PCredentials): Promise<void> {
    // Toda la lógica de login encapsulada
  }
}
```

### Configuración Centralizada

Todo en un solo lugar, fácil de modificar:

```typescript
// src/config.ts
export const config = {
  urls: { ... },
  paths: { ... },
  browser: { ... },
};
```

### Logger Simple

Logger efectivo sin complejidad innecesaria:

```typescript
logger.info('Mensaje informativo');
logger.success('Operación exitosa');
logger.error('Algo salió mal', error);
```

## 📝 Scripts Disponibles

| Script                   | Descripción                   |
| ------------------------ | ----------------------------- |
| `npm run login`          | Realiza login y guarda sesión |
| `npm run download`       | Descarga contenido True/False |
| `npm run verify-session` | Verifica sesión guardada      |
| `npm run type-check`     | Verifica tipos TypeScript     |
| `npm run lint`           | Ejecuta ESLint                |
| `npm run format`         | Formatea código con Prettier  |

## 🔧 Extender el Proyecto

### Agregar un nuevo script de descarga

1. **Crea el script** en `src/`:

```typescript
import { chromium } from 'playwright';
import { H5PDownloadPage } from './pages/h5p-download.page.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  // ... tu lógica
}

main();
```

2. **Agrega el comando** en `package.json`:

```json
{
  "scripts": {
    "download:mi-contenido": "tsx src/download-mi-contenido.ts"
  }
}
```

### Agregar un nuevo Page Object

1. **Crea el archivo** en `src/pages/`:

```typescript
export class MiNuevoPage {
  constructor(private readonly page: Page) {}

  async hacerAlgo(): Promise<void> {
    // Tu lógica
  }
}
```

2. **Úsalo** en tus scripts:

```typescript
const miPage = new MiNuevoPage(page);
await miPage.hacerAlgo();
```

## 🎓 Conceptos Aplicados

- **Page Object Pattern**: Separación de lógica de UI
- **Don't Repeat Yourself (DRY)**: Código reutilizable
- **Single Responsibility**: Cada clase hace una cosa bien
- **Type Safety**: TypeScript para prevenir errores
- **Clean Code**: Código legible y auto-documentado

## 📊 Métricas del Proyecto

- **Archivos de código**: ~10
- **Líneas de código**: ~250-300
- **Complejidad**: Baja, enfocada en legibilidad
- **Ratio funcionalidad/código**: Óptimo

## ⚡ Por Qué Esta Arquitectura

Este proyecto equilibra:

1. **Profesionalismo**: Usa patrones de diseño reconocidos
2. **Pragmatismo**: No hay código innecesario
3. **Escalabilidad**: Fácil agregar nuevos scripts
4. **Mantenibilidad**: Código claro y organizado

**No es sobre-ingeniería**, es arquitectura limpia aplicada correctamente.

## 🤝 Contribuir

1. Mantén la simplicidad
2. Documenta solo lo necesario
3. Sigue los patrones existentes
4. Ejecuta `npm run type-check` antes de commit

## 📄 Licencia

ISC

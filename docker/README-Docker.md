# 🐳 Guía de Docker para H5P Playwright

Esta guía te ayudará a usar la aplicación H5P Playwright con Docker, tanto para desarrollo local como para producción.

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Desarrollo Local](#desarrollo-local)
- [Producción](#producción)
- [Scripts Helpers](#scripts-helpers)
- [Persistencia de Datos](#persistencia-de-datos)
- [Troubleshooting](#troubleshooting)
- [Comandos Útiles](#comandos-útiles)

---

## Introducción

### ¿Qué es Docker?

Docker es una plataforma que permite ejecutar aplicaciones en **contenedores**, entornos aislados que incluyen todo lo necesario para que la aplicación funcione (código, dependencias, navegadores, etc.).

### ¿Por qué usar Docker con H5P Playwright?

✅ **Sin instalación manual**: No necesitas instalar Node.js, Playwright ni Chromium
✅ **Entorno consistente**: Funciona igual en cualquier sistema (macOS, Windows, Linux)
✅ **Aislamiento**: No afecta otras aplicaciones de tu sistema
✅ **Fácil de compartir**: Otros pueden ejecutar la misma configuración

---

## Requisitos Previos

### 1. Instalar Docker Desktop

**macOS:**
```bash
# Opción 1: Descargar desde docker.com
# https://www.docker.com/products/docker-desktop

# Opción 2: Con Homebrew
brew install --cask docker
```

**Windows:**
- Descargar Docker Desktop desde: https://www.docker.com/products/docker-desktop
- Seguir el instalador

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Fedora
sudo dnf install docker docker-compose
```

### 2. Verificar instalación

```bash
docker --version
# Debe mostrar: Docker version 20.x.x o superior

docker compose version
# Debe mostrar: Docker Compose version v2.x.x o superior
```

---

## Configuración Inicial

### 1. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
# Si no existe .env, créalo desde el ejemplo
cp .env.example .env

# Editar con tus credenciales de H5P.org
nano .env  # o usa tu editor favorito
```

Contenido del archivo `.env`:
```bash
H5P_USER=tu-usuario@ejemplo.com
H5P_PASS=tu-contraseña-secreta
HEADLESS=true
```

⚠️ **IMPORTANTE**: El archivo `.env` NO debe comitearse a git (ya está en .gitignore)

### 2. Construir la imagen Docker

```bash
# Opción 1: Script helper (recomendado)
./docker/docker-build.sh

# Opción 2: Docker Compose directo
docker compose build

# Opción 3: npm script
npm run docker:build
```

⏱️ **Primera vez**: Tomará 3-5 minutos (descarga navegador Chromium)
⏱️ **Siguientes veces**: 10-20 segundos (cacheo de dependencias)

---

## Desarrollo Local

El archivo `docker-compose.yml` está optimizado para desarrollo local con **acceso fácil a los archivos generados**.

### Flujo de trabajo típico

#### 1. Login inicial

Autentícate en H5P.org y guarda la sesión:

```bash
# Opción 1: Script helper (más fácil)
./docker/docker-login.sh

# Opción 2: Docker Compose directo
docker compose run --rm h5p npm run login

# Opción 3: npm script
npm run docker:login
```

✅ Esto creará el archivo `h5p-auth.json` con tu sesión

#### 2. Descargar contenido

Descarga archivos .h5p:

```bash
# Opción 1: Script helper
./docker/docker-download.sh

# Opción 2: Docker Compose directo
docker compose run --rm h5p npm run download

# Opción 3: npm script
npm run docker:download
```

✅ Los archivos se guardarán en `downloads/`

#### 3. Verificar sesión (opcional)

Verifica que tu sesión siga activa:

```bash
# Opción 1: Script helper
./docker/docker-verify.sh

# Opción 2: Docker Compose directo
docker compose run --rm h5p npm run verify-session

# Opción 3: npm script
npm run docker:verify
```

### Características de desarrollo

- **Bind mounts**: Los archivos generados aparecen inmediatamente en tu sistema
- **Código sincronizado**: Cambios en `src/` se reflejan sin rebuild
- **Fácil debugging**: Usa `./docker/docker-shell.sh` para entrar al container

---

## Producción

El archivo `docker-compose.prod.yml` está optimizado para **servidores y producción** con mejor performance y seguridad.

### Diferencias vs Desarrollo

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| Variables de entorno | `.env` | `.env.prod` |
| Volúmenes | Bind mounts | Named volumes |
| Reinicio automático | No | Sí (unless-stopped) |
| Límites de recursos | Laxos | Estrictos |
| Código sincronizado | Sí | No |

### Configuración para producción

#### 1. Crear archivo .env.prod

```bash
# Copiar template
cp .env.prod .env.prod.local

# Editar con credenciales de producción
nano .env.prod.local
```

⚠️ **IMPORTANTE**: NO comitear `.env.prod.local` a git

#### 2. Construir imagen

```bash
# Script helper con modo producción
./docker/docker-build.sh prod

# O directamente
docker compose -f docker-compose.prod.yml build
```

#### 3. Ejecutar comandos

```bash
# Login
docker compose -f docker-compose.prod.yml run --rm h5p npm run login

# Download
docker compose -f docker-compose.prod.yml run --rm h5p npm run download

# Verificar sesión
docker compose -f docker-compose.prod.yml run --rm h5p npm run verify-session
```

#### 4. Extraer archivos de named volumes

Como producción usa named volumes, necesitas extraer archivos manualmente:

```bash
# Listar volúmenes
docker volume ls | grep h5p

# Copiar archivos desde el volumen
docker cp h5p-playwright-prod:/app/downloads ./downloads-backup

# O usar un container temporal
docker run --rm -v h5p-downloads:/data -v $(pwd):/backup alpine cp -r /data /backup/downloads-backup
```

---

## Scripts Helpers

Los scripts en `docker/` facilitan el uso diario.

| Script | Descripción | Uso |
|--------|-------------|-----|
| `docker-build.sh` | Construir imagen Docker | `./docker/docker-build.sh` |
| `docker-login.sh` | Login en H5P.org | `./docker/docker-login.sh` |
| `docker-download.sh` | Descargar contenido | `./docker/docker-download.sh` |
| `docker-verify.sh` | Verificar sesión | `./docker/docker-verify.sh` |
| `docker-shell.sh` | Abrir terminal en container | `./docker/docker-shell.sh` |
| `docker-clean.sh` | Limpiar todo (⚠️ destructivo) | `./docker/docker-clean.sh` |

### Ejemplos de uso

```bash
# Build rápido
./docker/docker-build.sh

# Build para producción
./docker/docker-build.sh prod

# Flujo completo
./docker/docker-build.sh
./docker/docker-login.sh
./docker/docker-download.sh

# Debugging
./docker/docker-shell.sh
# Dentro del container:
# pwd → /app
# ls -la → ver archivos
# node --version → ver versión de Node
# exit → salir
```

---

## Persistencia de Datos

### Archivos generados

La aplicación genera 3 tipos de archivos que persisten entre ejecuciones:

#### 1. h5p-auth.json (Sesión de autenticación)

**Desarrollo:**
```yaml
# Bind mount directo
- ./h5p-auth.json:/app/h5p-auth.json
```
✅ Aparece inmediatamente en tu directorio
📁 Ubicación: `./h5p-auth.json`

**Producción:**
```yaml
# Named volume
- h5p-auth:/app/h5p-auth.json
```
⚡ Mejor performance
📁 Ubicación: Volumen Docker (usar `docker cp` para extraer)

#### 2. downloads/ (Archivos .h5p descargados)

**Desarrollo:**
```yaml
- ./downloads:/app/downloads
```
✅ Archivos descargados aparecen en `./downloads/`

**Producción:**
```yaml
- h5p-downloads:/app/downloads
```
⚡ Named volume (mejor performance)

#### 3. screenshots/ (Capturas de error)

**Desarrollo:**
```yaml
- ./screenshots:/app/screenshots
```
✅ Screenshots aparecen en `./screenshots/`

**Producción:**
```yaml
- h5p-screenshots:/app/screenshots
```
⚡ Named volume

### Backup de datos

```bash
# Desarrollo (fácil, son archivos locales)
tar -czf backup-h5p.tar.gz h5p-auth.json downloads/ screenshots/

# Producción (requiere docker cp)
docker cp h5p-playwright-prod:/app/downloads ./downloads-backup
docker cp h5p-playwright-prod:/app/h5p-auth.json ./h5p-auth-backup.json
```

---

## Troubleshooting

### Problema: "Cannot connect to the Docker daemon"

**Causa**: Docker Desktop no está ejecutándose

**Solución**:
```bash
# macOS: Abrir Docker Desktop desde Applications
open -a Docker

# Linux: Iniciar servicio Docker
sudo systemctl start docker
```

### Problema: "Error: h5p-auth.json no encontrado"

**Causa**: No has ejecutado login

**Solución**:
```bash
./docker/docker-login.sh
```

### Problema: "Permission denied" al ejecutar scripts

**Causa**: Scripts no tienen permisos de ejecución

**Solución**:
```bash
chmod +x docker/*.sh
```

### Problema: Build muy lento

**Causa**: Primera vez descarga navegador Chromium (~200 MB)

**Solución**: Espera pacientemente. Las siguientes veces serán mucho más rápidas (~10-20 segundos)

### Problema: "No space left on device"

**Causa**: Docker ha acumulado muchas imágenes/volúmenes

**Solución**:
```bash
# Ver uso de espacio
docker system df

# Limpiar todo lo no usado
docker system prune -a --volumes

# O usar el script
./docker/docker-clean.sh
```

### Problema: Container no puede acceder a internet

**Causa**: Firewall o configuración de red

**Solución**:
```bash
# Verificar conectividad desde el container
docker compose run --rm h5p ping -c 3 h5p.org

# Si falla, revisar configuración de Docker Desktop
# Settings → Resources → Network
```

### Problema: "Session expired" al descargar

**Causa**: La sesión guardada expiró (H5P.org requiere login frecuente)

**Solución**:
```bash
# Volver a hacer login
./docker/docker-login.sh
```

---

## Comandos Útiles

### Inspección

```bash
# Ver containers en ejecución
docker ps

# Ver todas las imágenes
docker images

# Ver volúmenes
docker volume ls

# Ver uso de espacio
docker system df

# Inspeccionar container
docker inspect h5p-playwright-dev

# Ver logs
docker compose logs h5p
```

### Limpieza

```bash
# Detener containers
docker compose down

# Detener y eliminar volúmenes
docker compose down --volumes

# Eliminar imagen
docker rmi h5p-playwright:latest

# Limpiar todo (⚠️ destructivo)
./docker/docker-clean.sh
```

### Debugging

```bash
# Shell interactivo
./docker/docker-shell.sh

# O directamente
docker compose run --rm h5p /bin/bash

# Ver variables de entorno dentro del container
docker compose run --rm h5p printenv

# Ejecutar comando personalizado
docker compose run --rm h5p node --version
```

### Performance

```bash
# Ver uso de recursos en tiempo real
docker stats h5p-playwright-dev

# Ver procesos dentro del container
docker compose exec h5p top
```

---

## Preguntas Frecuentes

### ¿Necesito tener Node.js instalado?

No, Docker incluye todo lo necesario (Node.js, Playwright, Chromium).

### ¿Puedo usar mi sesión existente (h5p-auth.json)?

Sí, si ya tienes un `h5p-auth.json` funcional, Docker lo usará automáticamente.

### ¿Puedo ver el navegador durante la ejecución?

No, Docker no tiene display gráfico. Siempre ejecuta en modo `HEADLESS=true`.

### ¿Cómo actualizo la imagen?

```bash
# Rebuild desde cero
docker compose build --no-cache

# O usa el script
./docker/docker-build.sh
```

### ¿Puedo ejecutar múltiples descargas en paralelo?

Sí, puedes ejecutar múltiples containers:

```bash
# Terminal 1
docker compose run --rm --name h5p-1 h5p npm run download

# Terminal 2
docker compose run --rm --name h5p-2 h5p npm run download
```

---

## Recursos Adicionales

- 📚 [Documentación oficial de Docker](https://docs.docker.com/)
- 🎭 [Documentación de Playwright](https://playwright.dev/)
- 🎓 [Tutorial de H5P](https://h5p.org/documentation)

---

## Soporte

Si encuentras problemas:

1. Revisa esta documentación
2. Revisa el [README principal](../README.md)
3. Consulta los logs: `docker compose logs h5p`
4. Abre un issue en el repositorio

---

**¡Feliz automatización! 🚀**

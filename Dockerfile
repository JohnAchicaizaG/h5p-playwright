# ============================================
# Dockerfile para H5P Playwright Automation
# ============================================
# Herramienta de automatización web para descargar contenidos H5P
# usando Playwright y TypeScript

# Imagen base oficial de Playwright con todas las dependencias del sistema
FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Metadata
LABEL maintainer="H5P Playwright Team"
LABEL description="Automatización de descarga de contenidos H5P con Playwright"
LABEL version="1.0.0"

# Variables de entorno por defecto
ENV NODE_ENV=production \
    HEADLESS=true \
    NPM_CONFIG_LOGLEVEL=warn

# Directorio de trabajo
WORKDIR /app

# ============================================
# Instalación de dependencias
# ============================================
# Copiar archivos de dependencias primero para aprovechar caché de Docker
COPY package*.json ./

# Instalar SOLO dependencias de producción (sin devDependencies)
# Esto excluye ESLint, Prettier, etc. que no son necesarios en runtime
RUN npm ci --omit=dev --quiet

# ============================================
# Copiar código fuente
# ============================================
# Copiar archivos de configuración
COPY tsconfig.json ./

# Copiar código fuente TypeScript
COPY src ./src

# ============================================
# Preparar directorios para volúmenes
# ============================================
# Crear directorios para archivos generados
# Estos se montarán como volúmenes desde el host
RUN mkdir -p downloads screenshots && \
    chmod 755 downloads screenshots

# ============================================
# Seguridad: Usuario no-root
# ============================================
# La imagen de Playwright ya incluye el usuario 'pwuser' (UID 1000)
# Cambiar a este usuario para no ejecutar como root (mejor práctica de seguridad)
USER pwuser

# ============================================
# Comando por defecto
# ============================================
# Por defecto muestra la ayuda
# Este comando puede ser sobrescrito en docker-compose.yml o docker run
CMD ["npm", "run", "login", "--", "--help"]

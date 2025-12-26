#!/bin/bash
# ============================================
# Script: Login en H5P.org
# ============================================
# Ejecuta el script de login y guarda la sesión

set -e

echo "======================================"
echo "  🔐 Login en H5P.org"
echo "======================================"
echo ""

# Verificar que .env existe
if [[ ! -f ".env" ]]; then
  echo "❌ Error: Archivo .env no encontrado"
  echo "Crea el archivo .env con tus credenciales"
  exit 1
fi

echo "Autenticando y guardando sesión..."
echo ""

# Cargar variables desde .env y pasarlas al container
source .env
docker compose run --rm \
  -e H5P_USER="$H5P_USER" \
  -e H5P_PASS="$H5P_PASS" \
  -e HEADLESS=true \
  h5p npm run login

echo ""
echo "✅ Login completado exitosamente"
echo "📁 Sesión guardada en: h5p-auth.json"
echo ""
echo "Siguiente paso:"
echo "  ./docker/docker-download.sh"

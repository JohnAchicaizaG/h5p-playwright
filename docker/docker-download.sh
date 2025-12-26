#!/bin/bash
# ============================================
# Script: Descargar contenido H5P
# ============================================
# Descarga archivos .h5p usando la sesión guardada

set -e

echo "======================================"
echo "  📥 Descargar contenido H5P"
echo "======================================"
echo ""

# Verificar que existe sesión
if [[ ! -f "h5p-auth.json" ]]; then
  echo "❌ Error: No se encontró sesión guardada (h5p-auth.json)"
  echo ""
  echo "Ejecuta primero:"
  echo "  ./docker/docker-login.sh"
  exit 1
fi

# Verificar que .env existe
if [[ ! -f ".env" ]]; then
  echo "❌ Error: Archivo .env no encontrado"
  exit 1
fi

echo "Descargando contenido..."
echo ""

# Cargar variables desde .env y pasarlas al container
source .env
docker compose run --rm \
  -e H5P_USER="$H5P_USER" \
  -e H5P_PASS="$H5P_PASS" \
  -e HEADLESS=true \
  h5p npm run download

echo ""
echo "✅ Descarga completada exitosamente"
echo "📁 Archivos guardados en: downloads/"

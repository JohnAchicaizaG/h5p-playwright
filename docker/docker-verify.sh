#!/bin/bash
# ============================================
# Script: Verificar sesión H5P
# ============================================
# Verifica que la sesión guardada siga activa

set -e

echo "======================================"
echo "  ✓ Verificar sesión H5P"
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

echo "Verificando sesión..."
echo ""

# Cargar variables desde .env y pasarlas al container
source .env
docker compose run --rm \
  -e H5P_USER="$H5P_USER" \
  -e H5P_PASS="$H5P_PASS" \
  -e HEADLESS=true \
  h5p npm run verify-session

echo ""
echo "✅ Verificación completada"

#!/bin/bash
# ============================================
# Script: Build de imagen Docker
# ============================================
# Construye la imagen Docker para desarrollo o producción

set -e

echo "======================================"
echo "  🐳 Build de imagen H5P Playwright"
echo "======================================"
echo ""

# Detectar si se especificó modo producción
if [[ "$1" == "prod" ]] || [[ "$1" == "production" ]]; then
  echo "Modo: PRODUCCIÓN"
  echo "Construyendo imagen para producción..."
  docker compose -f docker-compose.prod.yml build
else
  echo "Modo: DESARROLLO (default)"
  echo "Construyendo imagen para desarrollo..."
  docker compose build
fi

echo ""
echo "✅ Build completado exitosamente"
echo ""
echo "Siguientes pasos:"
echo "  - Desarrollo: ./docker/docker-login.sh"
echo "  - Producción: docker compose -f docker-compose.prod.yml run --rm h5p npm run login"

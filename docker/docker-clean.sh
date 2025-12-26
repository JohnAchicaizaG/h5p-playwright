#!/bin/bash
# ============================================
# Script: Limpiar containers, imágenes y datos
# ============================================
# Elimina containers, imágenes, volúmenes y archivos generados

set -e

echo "======================================"
echo "  🗑️  Limpieza de Docker"
echo "======================================"
echo ""
echo "⚠️  ADVERTENCIA: Esta operación eliminará:"
echo "  - Containers de H5P"
echo "  - Imágenes de H5P"
echo "  - Volúmenes de Docker"
echo "  - Archivos en downloads/ y screenshots/"
echo ""
read -p "¿Continuar? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operación cancelada"
  exit 0
fi

echo ""
echo "Deteniendo y eliminando containers..."
docker compose down --volumes --rmi all 2>/dev/null || true

echo "Limpiando archivos generados..."
rm -rf downloads/* screenshots/* 2>/dev/null || true

echo ""
echo "✅ Limpieza completada"
echo ""
echo "Para volver a usar:"
echo "  1. ./docker/docker-build.sh"
echo "  2. ./docker/docker-login.sh"
echo "  3. ./docker/docker-download.sh"

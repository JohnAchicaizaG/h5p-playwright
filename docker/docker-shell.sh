#!/bin/bash
# ============================================
# Script: Abrir shell interactivo
# ============================================
# Abre una terminal bash dentro del container para debugging

set -e

echo "======================================"
echo "  🐚 Shell interactivo Docker"
echo "======================================"
echo ""
echo "Abriendo shell en el container..."
echo "Usa 'exit' para salir"
echo ""

# Abrir bash en el container
docker compose run --rm h5p /bin/bash

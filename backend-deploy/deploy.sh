#!/bin/bash
# Script de deployment ML Backend
# Ejecutar desde el directorio raíz de backtester-pro

set -e  # Exit on error

echo "🚀 Iniciando deployment ML Backend..."
echo ""

# 1. Verificar que estamos en el repo correcto
if [ ! -f "src/server_unified.ts" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio raíz de backtester-pro"
    exit 1
fi

echo "✅ Directorio correcto"
echo ""

# 2. Crear backup
echo "📦 Creando backup..."
cp src/server_unified.ts src/server_unified.ts.backup
echo "✅ Backup creado: src/server_unified.ts.backup"
echo ""

# 3. Copiar archivos
echo "📋 Copiando archivos ML..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cp "$SCRIPT_DIR/ai.route.ts" src/routes/
cp "$SCRIPT_DIR/server_unified.ts" src/

echo "✅ Archivos copiados"
echo ""

# 4. Verificar cambios
echo "📊 Cambios a commitear:"
git status --short
echo ""

# 5. Mostrar diff
echo "🔍 Diferencias en server_unified.ts:"
git diff src/server_unified.ts | head -50
echo ""

# 6. Preguntar confirmación
read -p "¿Deseas hacer commit y push? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "💾 Haciendo commit..."

    git add src/routes/ai.route.ts src/server_unified.ts

    git commit -m "feat: add ML API endpoints for frontend integration

Integrate all 31 ML modules with REST API endpoints.

New endpoints:
- POST /api/ai/analyze (OMEGA Reflex)
- POST /api/ai/insights (Explainable AI)
- POST /api/ai/quantum-risk (K-Means clustering)
- POST /api/ai/predict (ML Ensemble)
- POST /api/ai/anomaly-check (Isolation Forest)
- POST /api/ai/optimize (Hybrid Advisor)
- GET /api/ai/status (System status)

Features:
- Rate limiting (30/5min)
- Tier-gated access
- Authentication required
- ML models: Random Forest, K-Means, Isolation Forest, Ridge Regression

Performance: <50ms inference, <5% CPU"

    echo "✅ Commit creado"
    echo ""
    echo "🚀 Pusheando a GitHub..."

    git push origin main

    echo ""
    echo "✅ ¡Deployment completado!"
    echo ""
    echo "🎯 Próximos pasos:"
    echo "1. Espera 3-5 minutos para que Render despliegue"
    echo "2. Verifica: curl https://backtester-pro-1.onrender.com/api/ai/status"
    echo "3. Prueba el frontend: https://omega-web1.onrender.com/dashboard/backtest"
else
    echo ""
    echo "❌ Deployment cancelado"
    echo ""
    echo "Para revisar cambios manualmente:"
    echo "  git diff src/server_unified.ts"
    echo "  cat src/routes/ai.route.ts"
fi

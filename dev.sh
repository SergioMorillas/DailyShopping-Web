#!/bin/bash

# ── DailyShopping dev script ──────────────────────────────────────────────────
# Arranca backend (puerto 3001) y frontend (puerto 5173) en paralelo.
# Ctrl+C para parar ambos.

export PATH="/home/smorillas/.config/JetBrains/WebStorm2025.3/node/versions/24.14.0/bin:$PATH"

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Matar procesos que puedan estar usando los puertos
kill $(lsof -ti:3001) 2>/dev/null && echo "→ Puerto 3001 liberado"
kill $(lsof -ti:5173) 2>/dev/null && echo "→ Puerto 5173 liberado"

# Función para limpiar al salir con Ctrl+C
cleanup() {
  echo ""
  echo "Parando servicios..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# Arrancar backend
echo ""
echo "▶  Arrancando backend  → http://localhost:3001"
cd "$ROOT/server" && npm run dev &
BACKEND_PID=$!

# Esperar a que el backend esté listo
sleep 2

# Arrancar frontend
echo "▶  Arrancando frontend → http://localhost:5173"
echo ""
cd "$ROOT" && npm run dev &
FRONTEND_PID=$!

# Esperar a que terminen
wait "$BACKEND_PID" "$FRONTEND_PID"

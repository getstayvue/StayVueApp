#!/bin/bash

# ─── StayVue Property Manager — Local Dev Startup ───

set -e

echo ""
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     StayVue Property Manager          ║"
echo "  ║     Starting local dev server…        ║"
echo "  ╚═══════════════════════════════════════╝"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
  echo "❌  Node.js is not installed. Please install Node.js 18+ first."
  echo "    https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌  Node.js 18+ required. You have $(node -v)."
  exit 1
fi

echo "✓  Node.js $(node -v) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦  Installing dependencies…"
  npm install
  echo ""
fi

# Clean any stale database so schema changes take effect
if [ -f "data/airbnb.db" ]; then
  echo "🗑️   Removing old database (new schema will be created on start)…"
  rm -f data/airbnb.db
fi

# Start the backend API server in the background
echo "🚀  Starting API server on http://localhost:3001…"
PORT=3001 node server/index.js &
SERVER_PID=$!

# Give the server a moment to boot
sleep 2

# Start the Vite frontend dev server
echo "🚀  Starting frontend on http://localhost:5173…"
echo ""
echo "  ────────────────────────────────────────"
echo "  Open in your browser:"
echo ""
echo "    👉  http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "  ────────────────────────────────────────"
echo ""

# Trap Ctrl+C to kill the background server too
cleanup() {
  echo ""
  echo "🛑  Shutting down…"
  kill $SERVER_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

npx vite --port 5173

# If vite exits on its own, also kill the server
kill $SERVER_PID 2>/dev/null

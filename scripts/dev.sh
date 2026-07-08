#!/bin/sh
set -e

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but the daemon is not running. Start Docker Desktop and retry."
  exit 1
fi

echo "Starting Panelka (postgres, redis, backend, frontend)..."
echo "Backend:  http://localhost:8000  (docs at /docs)"
echo "Frontend: http://localhost:3000"

exec docker compose up --build

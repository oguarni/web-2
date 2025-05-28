#!/bin/bash
set -e

echo "🚀 Iniciando Sistema de Reservas..."

# Aguardar bancos de dados estarem prontos
echo "⏳ Aguardando PostgreSQL..."
./scripts/wait-for-it.sh postgres:5432 --timeout=60 --strict

echo "⏳ Aguardando MongoDB..."
./scripts/wait-for-it.sh mongodb:27017 --timeout=60 --strict

echo "✅ Bancos de dados prontos!"

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
exec node app.js

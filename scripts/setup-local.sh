#!/bin/bash
echo "�� Configurando ambiente local..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale com:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

# Verificar PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    echo "🔄 Iniciando PostgreSQL..."
    sudo systemctl start postgresql || {
        echo "❌ PostgreSQL não encontrado. Instale com:"
        echo "sudo apt update && sudo apt install postgresql postgresql-contrib"
        exit 1
    }
fi

# Verificar MongoDB (opcional)
if ! systemctl is-active --quiet mongod; then
    echo "🔄 Tentando iniciar MongoDB..."
    sudo systemctl start mongod 2>/dev/null || echo "⚠️  MongoDB não encontrado (opcional)"
fi

# Criar banco local se não existir
echo "📊 Configurando banco local..."
sudo -u postgres psql -c "CREATE DATABASE web2_db_local;" 2>/dev/null || echo "BD já existe"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

echo "✅ Ambiente local configurado!"
echo ""
echo "Para executar:"
echo "  Local:  npm run local"
echo "  Docker: npm run docker"

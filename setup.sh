#!/bin/bash

# Script de configuração automática para o Sistema de Reservas de Espaços
# Projeto Web-2 - Gabriel Felipe Guarnieri

echo "================================="
echo "🚀 SETUP - Sistema de Reservas"
echo "================================="
echo ""

# Função para verificar se um comando existe
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 não está instalado. Por favor, instale $1 primeiro."
        exit 1
    fi
}

# Verificar pré-requisitos
echo "📋 Verificando pré-requisitos..."
check_command node
check_command npm
check_command psql

echo "✅ Node.js versão: $(node --version)"
echo "✅ NPM versão: $(npm --version)"
echo "✅ PostgreSQL disponível"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Falha ao instalar dependências. Verifique seu package.json."
    exit 1
fi

echo "✅ Dependências instaladas com sucesso!"
echo ""

# Configurar variáveis de ambiente
echo "⚙️  Configurando variáveis de ambiente..."

if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo ""
    echo "🔧 IMPORTANTE: Edite o arquivo .env para configurar suas credenciais:"
    echo "   - MONGODB_URI (para MongoDB Atlas)"
    echo "   - POSTGRES_* (para PostgreSQL)"
    echo ""
else
    echo "✅ Arquivo .env já existe"
fi

# Verificar se PostgreSQL está rodando
echo "🔍 Verificando PostgreSQL..."
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "⚠️  PostgreSQL não está rodando em localhost:5432"
    echo "   Por favor, inicie o PostgreSQL ou configure as variáveis de ambiente"
else
    echo "✅ PostgreSQL está rodando"
fi

# Verificar se MongoDB está rodando (local)
echo "🔍 Verificando MongoDB..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  MongoDB local não está rodando"
    echo "   Configure MONGODB_URI no .env para usar MongoDB Atlas"
else
    echo "✅ MongoDB local está rodando"
fi

echo ""
echo "🧪 Testando conexões de banco de dados..."

# Testar conexão com bancos
echo "📊 Testando PostgreSQL..."
node -e "
require('./config/db_sequelize').sequelize.authenticate()
.then(() => console.log('✅ PostgreSQL: Conexão OK'))
.catch(err => console.log('❌ PostgreSQL: ' + err.message))
.finally(() => process.exit(0))
" 2>/dev/null

echo "📊 Testando MongoDB..."
node -e "
require('./config/db_mongoose').connectDB()
.then(() => console.log('✅ MongoDB: Conexão OK'))
.catch(err => console.log('❌ MongoDB: ' + err.message))
.finally(() => process.exit(0))
" 2>/dev/null

echo ""
echo "🔍 Executando testes de requisitos..."
npm test

echo ""
echo "================================="
echo "🎉 SETUP CONCLUÍDO!"
echo "================================="
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute: npm start"
echo "   2. Acesse: http://localhost:3000"
echo "   3. Login: admin / admin123"
echo ""
echo "📚 Para demonstrar os requisitos:"
echo "   node demo_requisitos.js"
echo ""
echo "🔧 Se houver problemas:"
echo "   - Verifique o arquivo .env"
echo "   - Confirme que PostgreSQL está rodando"
echo "   - Configure MONGODB_URI para Atlas se necessário"
echo ""
echo "📖 Documentação completa no README.md"
echo "================================="
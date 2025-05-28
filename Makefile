.PHONY: help setup-local local docker docker-build docker-stop status

help: ## Mostrar comandos disponíveis
	@echo "Comandos disponíveis:"
	@echo "  make setup-local  # Configurar ambiente local"
	@echo "  make local        # Executar localmente (porta 3000)"
	@echo "  make docker       # Executar no Docker (porta 8081)"
	@echo "  make docker-build # Construir e executar Docker"
	@echo "  make docker-stop  # Parar Docker"
	@echo "  make status       # Ver status dos serviços"

setup-local: ## Configurar ambiente local
	@./scripts/setup-local.sh

local: ## Executar localmente
	@echo "🏠 Iniciando em modo LOCAL (http://localhost:3000)..."
	@NODE_ENV=development LOCAL=true npm start

local-dev: ## Executar localmente com auto-reload
	@echo "🏠 Iniciando em modo LOCAL DEV (http://localhost:3000)..."
	@NODE_ENV=development LOCAL=true npx nodemon app.js

docker: ## Executar no Docker
	@echo "🐳 Iniciando no DOCKER (http://localhost:8081)..."
	@docker-compose up -d
	@echo "✅ Docker iniciado! Logs: make docker-logs"

docker-build: ## Construir e executar Docker
	@echo "🔨 Construindo e iniciando Docker..."
	@docker-compose build --no-cache
	@docker-compose up -d

docker-stop: ## Parar Docker
	@echo "⏹️  Parando Docker..."
	@docker-compose down

docker-logs: ## Ver logs do Docker
	@docker-compose logs -f app

status: ## Verificar status
	@echo "📊 Status dos Serviços:"
	@echo ""
	@echo "🏠 LOCAL (porta 3000):"
	@curl -s http://localhost:3000 >/dev/null && echo "  ✅ Funcionando" || echo "  ❌ Parado"
	@echo ""
	@echo "🐳 DOCKER (porta 8081):"
	@curl -s http://localhost:8081 >/dev/null && echo "  ✅ Funcionando" || echo "  ❌ Parado"
	@echo ""
	@echo "📊 PostgreSQL:"
	@systemctl is-active --quiet postgresql && echo "  ✅ Funcionando" || echo "  ❌ Parado"
	@echo ""
	@echo "🍃 MongoDB:"
	@systemctl is-active --quiet mongod && echo "  ✅ Funcionando" || echo "  ❌ Parado/Não instalado"

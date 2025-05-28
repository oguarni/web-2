# Multi-stage build para otimização
FROM node:18-alpine AS dependencies

# Instalar dependências do sistema
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# ===================================
FROM node:18-alpine AS runtime

# Instalar dependências mínimas
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash \
    dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependências da stage anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fonte
COPY --chown=nodejs:nodejs . .

# Copiar scripts
COPY --chown=nodejs:nodejs scripts/ ./scripts/
RUN chmod +x scripts/*.sh

# Health check
COPY --chown=nodejs:nodejs healthcheck.js ./
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 8081

# Usar dumb-init para gerenciamento de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização
CMD ["./scripts/start.sh"]

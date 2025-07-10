# --- Estágio 1: Build ---
# Usamos uma imagem 'builder' para compilar a aplicação e manter a imagem final leve.
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# 1. Instala as dependências do backend.
# Copiamos apenas o package.json para aproveitar o cache do Docker.
COPY package*.json ./
RUN npm install

# 2. Copia TODO o código-fonte da aplicação (backend e frontend).
# Agora, todos os arquivos, incluindo client/public/index.html, estão no contexto.
COPY . .

# 3. Instala as dependências do frontend e constrói a aplicação React.
WORKDIR /usr/src/app/client
RUN npm install
# Este comando agora funcionará, pois o index.html e outros arquivos estão presentes.
RUN npm run build

# --- Estágio 2: Produção ---
# Esta é a imagem final, que será muito menor.
FROM node:18-alpine
WORKDIR /usr/src/app

# Copia as dependências de produção do estágio de build.
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --omit=dev

# Copia o código-fonte do backend do estágio de build.
COPY --from=builder /usr/src/app .

# Copia a pasta 'build' do frontend (o resultado do 'npm run build') do estágio de build.
COPY --from=builder /usr/src/app/client/build ./client/build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expõe a porta e define o comando para iniciar a aplicação.
EXPOSE 8081
CMD ["node", "app.js"]

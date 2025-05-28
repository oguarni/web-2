FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código
COPY . .

# Expor porta
EXPOSE 8081

# Comando para iniciar
CMD ["node", "app.js"]

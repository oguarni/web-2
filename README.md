# Sistema de Reservas de Espaços

Sistema completo de gerenciamento de reservas de espaços coletivos desenvolvido com Node.js, seguindo arquitetura MVC e utilizando bancos de dados relacionais e não-relacionais.

## 📋 Sobre o Projeto

Este sistema permite o gerenciamento eficiente de reservas de espaços, com controle de usuários, validação de conflitos de horários e sistema completo de logs. Foi desenvolvido como projeto acadêmico para demonstrar a integração entre diferentes tecnologias e bancos de dados.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM (Object-Relational Mapping) que permite trabalhar com bancos SQL usando JavaScript ao invés de queries SQL diretas
- **Mongoose** - ODM para MongoDB

### Bancos de Dados
- **PostgreSQL** - Dados relacionais (usuários e reservas)
- **MongoDB** - Dados não-relacionais (logs do sistema)

### Frontend
- **Express-Handlebars** - Template engine
- **HTML/CSS** - Interface responsiva

### Segurança
- **Express-Session** - Gerenciamento de sessões
- **Middlewares customizados** - Autenticação e autorização

## ✨ Funcionalidades

### Para Todos os Usuários
- ✅ Login/Logout seguro
- ✅ Criar novas reservas
- ✅ Visualizar próprias reservas
- ✅ Editar/cancelar próprias reservas
- ✅ Verificação automática de conflitos de horários

### Para Administradores
- ✅ Gerenciar todos os usuários
- ✅ Visualizar todas as reservas
- ✅ Alterar status de reservas
- ✅ Acessar logs do sistema
- ✅ Criar novos usuários

## 📊 Modelagem de Dados

### PostgreSQL (Relacional)
```
Usuario (1) -----> (N) Reserva
```

**Tabela Usuario:**
- id (PK)
- nome
- login (único)
- senha
- tipo (1=admin, 2=comum)

**Tabela Reserva:**
- id (PK)
- titulo
- dataInicio
- dataFim
- descricao
- local
- status (pendente/confirmada/cancelada)
- usuarioId (FK)

### MongoDB (NoSQL)
**Collection Logs:**
- usuarioId
- acao
- timestamp
- ip
- detalhes

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v14+)
- PostgreSQL
- MongoDB
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/oguarni/sistema-reservas-espacos.git
cd sistema-reservas-espacos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o PostgreSQL**
- Edite `config/db_sequelize.js`:
```javascript
const sequelize = new Sequelize('web2_db', 'seu_usuario', 'sua_senha', {
    host: 'localhost',
    dialect: 'postgres'
});
```

4. **Configure o MongoDB**
- Edite `config/db_mongoose.js`:
```javascript
const StringCon = {
    connection: "mongodb://localhost:27017/reservas_db"
    // ou use MongoDB Atlas:
    // connection: "mongodb+srv://user:pass@cluster.mongodb.net/reservas_db"
}
```

5. **Crie as tabelas (primeira execução)**
- Em `routers/route.js`, descomente o bloco de sincronização:
```javascript
db.sequelize.sync({force: true}).then(() => {
    // Código de criação das tabelas
});
```

6. **Execute o projeto**
```bash
npm start
```

7. **Acesse no navegador**
```
http://localhost:8081
```

## 👥 Usuários Padrão

| Tipo | Login | Senha | Permissões |
|------|-------|-------|------------|
| Administrador | admin | 1234 | Acesso total ao sistema |
| Usuário Comum | usuario | 1234 | Acesso às próprias reservas |

## 📂 Estrutura do Projeto

```
sistema-reservas-espacos/
├── app.js                  # Arquivo principal
├── package.json            # Dependências
├── config/                 # Configurações
│   ├── db_sequelize.js     # Config PostgreSQL
│   └── db_mongoose.js      # Config MongoDB
├── controllers/            # Lógica de negócio
│   ├── controllerUsuario.js
│   ├── controllerReserva.js
│   └── controllerLog.js
├── middlewares/            # Middlewares
│   └── auth.js             # Autenticação/Autorização
├── models/                 # Modelos de dados
│   ├── relational/         # Modelos Sequelize
│   │   ├── usuario.js
│   │   └── reserva.js
│   └── noSql/              # Modelos Mongoose
│       └── log.js
├── routers/                # Rotas
│   └── route.js
└── views/                  # Interfaces (Handlebars)
    ├── layouts/
    │   ├── main.handlebars
    │   └── noMenu.handlebars
    ├── usuario/
    ├── reserva/
    └── home.handlebars
```

## 🔒 Segurança

- **Autenticação**: Sistema de login com sessões
- **Autorização**: Middlewares para controle de acesso
- **Validação**: Verificação de conflitos de reservas
- **Logs**: Registro de todas as ações importantes

## 📝 Rotas Principais

### Públicas
- `GET /` - Tela de login
- `POST /login` - Processar login

### Autenticadas
- `GET /home` - Página inicial
- `GET /logout` - Realizar logout
- `GET /reservaCreate` - Formulário nova reserva
- `GET /reservaList` - Listar reservas

### Administrativas
- `GET /usuarioList` - Listar usuários
- `GET /usuarioCreate` - Criar usuário
- `GET /logList` - Visualizar logs

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐳 Docker

### Usando Docker Compose

1. **Crie um arquivo `docker-compose.yml`**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
      POSTGRES_DB: web2_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  app:
    build: .
    ports:
      - "8081:8081"
    depends_on:
      - postgres
      - mongodb
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
  mongo_data:
```

2. **Crie um arquivo `Dockerfile`**:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081

CMD ["npm", "start"]
```

3. **Execute com Docker**:
```bash
docker-compose up -d
```

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Gabriel Felipe Guarnieri**

---

⭐ Se este projeto te ajudou, considere dar uma estrela!

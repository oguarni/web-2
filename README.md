# Sistema de Reservas de Espaços

Sistema completo de gerenciamento de reservas de espaços coletivos desenvolvido com Node.js, seguindo arquitetura MVC e utilizando bancos de dados relacionais e não-relacionais.

## 📋 Sobre o Projeto

Este sistema permite o gerenciamento eficiente de reservas de espaços, com controle de usuários, validação de conflitos de horários e sistema completo de logs. Foi desenvolvido como projeto acadêmico para demonstrar a integração entre diferentes tecnologias e bancos de dados.

**Novidade:** Agora inclui uma **API REST completa** com autenticação por token para integração com outros sistemas.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para bancos SQL
- **Mongoose** - ODM para MongoDB

### Bancos de Dados
- **PostgreSQL** - Dados relacionais (usuários, reservas, espaços)
- **MongoDB** - Dados não-relacionais (logs do sistema)

### Frontend
- **Express-Handlebars** - Template engine
- **HTML/CSS** - Interface responsiva

### Segurança & API
- **Express-Session** - Gerenciamento de sessões web
- **Token Authentication** - Autenticação da API com crypto nativo
- **Middlewares customizados** - Autenticação e autorização

## ✨ Funcionalidades

### Interface Web

#### Para Todos os Usuários
- ✅ Login/Logout seguro
- ✅ Criar novas reservas
- ✅ Visualizar próprias reservas
- ✅ Editar/cancelar próprias reservas
- ✅ Verificação automática de conflitos de horários

#### Para Administradores
- ✅ Gerenciar todos os usuários
- ✅ Gerenciar espaços disponíveis
- ✅ Visualizar todas as reservas
- ✅ Alterar status de reservas
- ✅ Acessar logs do sistema
- ✅ Criar novos usuários

### API REST (Novo!)

#### Autenticação
- ✅ Login com token JWT-like
- ✅ Controle de acesso por perfil
- ✅ Tokens com expiração automática

#### Operações CRUD
- ✅ **Usuários** - Gerenciamento completo (admin)
- ✅ **Reservas** - CRUD com validações de negócio
- ✅ **Espaços** - Gerenciamento de locais
- ✅ **Logs** - Consulta e estatísticas do sistema

#### Recursos Especiais
- ✅ Verificação de disponibilidade de espaços
- ✅ Estatísticas e relatórios de logs
- ✅ Paginação e filtros avançados
- ✅ Documentação interativa

## 📊 Modelagem de Dados

### PostgreSQL (Relacional)
```
Usuario (1) -----> (N) Reserva
Espaco (1) -----> (N) Reserva
```

**Tabela Usuario:**
- id (PK), nome, login (único), senha, tipo (1=admin, 2=comum)

**Tabela Reserva:**
- id (PK), titulo, dataInicio, dataFim, descricao, status, usuarioId (FK), espacoId (FK)

**Tabela Espaco:**
- id (PK), nome, descricao, capacidade, localizacao, equipamentos, ativo

### MongoDB (NoSQL)
**Collection Logs:**
- usuarioId, acao, timestamp, ip, detalhes

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v14+)
- PostgreSQL
- MongoDB
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/oguarni/web-2.git
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
Interface Web: http://localhost:8081
API REST: http://localhost:8081/api
Documentação API: http://localhost:8081/api (GET)
```

## 👥 Usuários Padrão

| Tipo | Login | Senha | Permissões |
|------|-------|-------|------------|
| Administrador | admin | 1234 | Acesso total (web + API) |
| Usuário Comum | usuario | 1234 | Acesso às próprias reservas |

## 📂 Estrutura do Projeto

```
sistema-reservas-espacos/
├── app.js                  # Arquivo principal
├── package.json            # Dependências
├── API_DOCUMENTATION.md    # Documentação da API
├── config/                 # Configurações
│   ├── db_sequelize.js     # Config PostgreSQL
│   └── db_mongoose.js      # Config MongoDB
├── controllers/            # Lógica de negócio
│   ├── api/                # Controllers da API
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── reservaController.js
│   │   ├── espacoController.js
│   │   └── logController.js
│   ├── controllerUsuario.js
│   ├── controllerReserva.js
│   └── controllerLog.js
├── middlewares/            # Middlewares
│   ├── auth.js             # Auth web
│   └── tokenAuth.js        # Auth API
├── models/                 # Modelos de dados
│   ├── relational/         # Modelos Sequelize
│   │   ├── usuario.js
│   │   ├── reserva.js
│   │   └── espaco.js
│   └── noSql/              # Modelos Mongoose
│       └── log.js
├── routers/                # Rotas
│   ├── route.js            # Rotas web
│   └── api.js              # Rotas API
└── views/                  # Interfaces (Handlebars)
    ├── layouts/
    ├── usuario/
    ├── reserva/
    └── home.handlebars
```

## 🔒 Segurança

### Interface Web
- **Autenticação**: Sistema de login com sessões
- **Autorização**: Middlewares para controle de acesso
- **Validação**: Verificação de conflitos de reservas

### API REST
- **Token Authentication**: Tokens seguros com crypto nativo
- **Controle de Acesso**: Middleware baseado em perfis
- **Validação de Entrada**: Sanitização de dados
- **Rate Limiting**: Controle de requisições por IP

## 📝 Rotas

### Interface Web
- `GET /` - Tela de login
- `GET /home` - Página inicial
- `GET /reservaCreate` - Nova reserva
- `GET /reservaList` - Listar reservas
- `GET /usuarioList` - Listar usuários (admin)
- `GET /logList` - Visualizar logs (admin)

### API REST
- `POST /api/auth/login` - Autenticação
- `GET /api/usuarios` - Listar usuários
- `POST /api/reservas` - Criar reserva
- `GET /api/espacos` - Listar espaços
- `GET /api/logs` - Logs do sistema

## 🌐 Usando a API

### 1. Autenticação
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "senha": "1234"}'
```

### 2. Criar reserva
```bash
curl -X POST http://localhost:8081/api/reservas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Reunião",
    "dataInicio": "2025-01-15T09:00:00.000Z",
    "dataFim": "2025-01-15T11:00:00.000Z",
    "espacoId": 1
  }'
```

### 3. Verificar disponibilidade
```bash
curl "http://localhost:8081/api/espacos/1/disponibilidade?dataInicio=2025-01-15T09:00:00.000Z&dataFim=2025-01-15T11:00:00.000Z" \
  -H "Authorization: Bearer <token>"
```

📋 **Documentação completa da API:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

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

2. **Execute com Docker**:
```bash
docker-compose up -d
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Gabriel Felipe Guarnieri**

---

## 📈 Etapas do Projeto

- ✅ **Etapa 1**: Interface web com MVC
- ✅ **Etapa 2**: Integração com bancos de dados
- ✅ **Etapa 3**: API REST com autenticação por token

⭐ **Projeto acadêmico completo!** Se este projeto te ajudou, considere dar uma estrela!

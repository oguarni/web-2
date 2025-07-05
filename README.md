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
- ✅ **Cadastro público** - Criar conta em `/register`
- ✅ **Login/Logout seguro** - Autenticação por sessão
- ✅ **Criar novas reservas** - Com validação automática
- ✅ **Visualizar próprias reservas** - Interface intuitiva
- ✅ **Editar/cancelar reservas** - Controle total das próprias reservas
- ✅ **Verificação de conflitos** - Validação automática de horários

#### Para Gestores (Tipo 3)
- ✅ **Gerenciar espaços** - CRUD completo de espaços
- ✅ **Visualizar todas as reservas** - Visão geral do sistema
- ✅ **Alterar status de reservas** - Aprovar/rejeitar reservas
- ✅ **Gerenciar amenidades** - Configurar facilidades dos espaços

#### Para Administradores (Tipo 1)
- ✅ **Acesso total ao sistema** - Todas as funcionalidades
- ✅ **Gerenciar usuários** - CRUD completo de usuários
- ✅ **Acessar logs do sistema** - Auditoria completa
- ✅ **Limpeza de logs** - Manutenção do sistema
- ✅ **Configurações avançadas** - Parâmetros do sistema

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

Espaco (N) <---> (N) Amenity [através de EspacoAmenity]
```

**Tabela Usuario:**
- id (PK), nome, login (único), senha, tipo (1=admin, 2=comum, 3=gestor)

**Tabela Reserva:**
- id (PK), titulo, dataInicio, dataFim, descricao, status, usuarioId (FK), espacoId (FK)

**Tabela Espaco:**
- id (PK), nome, descricao, capacidade, localizacao, equipamentos, ativo

**Tabela Amenity:**
- id (PK), nome, descricao

**Tabela EspacoAmenity (N:N):**
- id (PK), espacoId (FK), amenityId (FK)

**Total: 5 tabelas com 35+ colunas** ✅

### MongoDB (NoSQL)
**Collection Logs:**
- usuarioId, acao, timestamp, ip, detalhes, _id

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v14+)
- PostgreSQL
- MongoDB (local) ou MongoDB Atlas (cloud)
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

3. **Configure o PostgreSQL (Opção 1 - Variáveis de Ambiente)**
```bash
export DB_NAME=web2_db
export DB_USER=postgres
export DB_PASS=sua_senha
export DB_HOST=localhost
export DB_PORT=5432
```

**Ou configure diretamente em `config/db_sequelize.js`:**
```javascript
const DB_CONFIG = {
    database: 'web2_db',
    username: 'seu_usuario',
    password: 'sua_senha',
    host: 'localhost',
    port: 5432,
    // ... outras configurações
};
```

4. **Configure o MongoDB**

**Opção A - MongoDB Atlas (Recomendado):**
```bash
export MONGODB_URI="mongodb+srv://usuario:senha@cluster.mongodb.net/reservas_db"
```

**Opção B - MongoDB Local:**
```bash
export MONGODB_URI="mongodb://localhost:27017/reservas_db"
```

**Ou configure diretamente em `config/db_mongoose.js`:**
```javascript
const StringCon = {
    connection: process.env.MONGODB_URI || "mongodb://localhost:27017/reservas_db"
};
```

5. **Execute o projeto (primeira vez)**
```bash
npm start
```

**✨ Novidade:** O sistema agora possui **sincronização automática**!
- ✅ **Cria o banco PostgreSQL** automaticamente se não existir
- ✅ **Sincroniza as tabelas** automaticamente se não existirem
- ✅ **Cria usuários padrão** automaticamente
- ✅ **Popula dados de exemplo** (espaços e amenidades)
- ✅ **Conecta com MongoDB** com fallback automático

6. **Acesse no navegador**
```
Interface Web: http://localhost:8082
API REST: http://localhost:8082/api
Documentação API: http://localhost:8082/api/docs
```

7. **Teste a instalação**
```bash
npm test
```
Este comando executa uma validação completa dos requisitos do sistema.

## 👥 Usuários Padrão

O sistema cria automaticamente 3 usuários padrão na primeira execução:

| Tipo | Login | Senha | Permissões |
|------|-------|-------|------------|
| **Administrador** | `admin` | `admin123` | ✅ Acesso total ao sistema<br>✅ Gerenciar usuários e logs<br>✅ API e interface web |
| **Usuário Comum** | `usuario` | `usuario123` | ✅ Criar e gerenciar próprias reservas<br>✅ Visualizar espaços disponíveis<br>✅ API e interface web |
| **Gestor** | `gestor` | `gestor123` | ✅ Gerenciar espaços e amenidades<br>✅ Visualizar todas as reservas<br>✅ Aprovar/rejeitar reservas<br>✅ API e interface web |

### 🔐 Segurança dos Usuários
- ✅ **Senhas criptografadas** com bcrypt (salt rounds: 10)
- ✅ **Tipos de usuário validados** (1=Admin, 2=Comum, 3=Gestor)
- ✅ **Logins únicos** para evitar duplicatas
- ✅ **Criação automática** apenas se não existirem

### 📝 Cadastro Público
Usuários podem se cadastrar publicamente em `/register` com tipo "Usuário Comum" por padrão.

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
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "senha": "admin123"}'
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Administrador",
    "login": "admin",
    "tipo": 1
  }
}
```

### 2. Listar espaços disponíveis
```bash
curl -X GET http://localhost:8082/api/espacos \
  -H "Authorization: Bearer <token>"
```

### 3. Verificar disponibilidade de um espaço
```bash
curl "http://localhost:8082/api/espacos/1/disponibilidade?dataInicio=2025-01-15T09:00:00.000Z&dataFim=2025-01-15T11:00:00.000Z" \
  -H "Authorization: Bearer <token>"
```

### 4. Criar nova reserva
```bash
curl -X POST http://localhost:8082/api/reservas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Reunião de Equipe",
    "dataInicio": "2025-01-15T09:00:00.000Z",
    "dataFim": "2025-01-15T11:00:00.000Z",
    "espacoId": 1,
    "descricao": "Reunião semanal da equipe de desenvolvimento"
  }'
```

### 5. Listar minhas reservas
```bash
curl -X GET http://localhost:8082/api/reservas \
  -H "Authorization: Bearer <token>"
```

### 6. Buscar logs do sistema (apenas admin)
```bash
curl "http://localhost:8082/api/logs?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 7. Obter estatísticas de logs (apenas admin)
```bash
curl -X GET http://localhost:8082/api/logs/stats \
  -H "Authorization: Bearer <token>"
```

### 8. Criar novo usuário (apenas admin)
```bash
curl -X POST http://localhost:8082/api/usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "login": "joao.silva",
    "senha": "senha123",
    "tipo": 2
  }'
```

### 9. Listar amenidades
```bash
curl -X GET http://localhost:8082/api/amenities \
  -H "Authorization: Bearer <token>"
```

### 10. Associar amenidade a espaço (admin/gestor)
```bash
curl -X POST http://localhost:8082/api/espaco-amenities \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "espacoId": 1,
    "amenityId": 2
  }'
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

# Sistema de Reservas de Espaços

Sistema completo de gerenciamento de reservas de espaços coletivos desenvolvido com Node.js, seguindo arquitetura MVC e utilizando bancos de dados relacionais e não-relacionais. Totalmente containerizado com Docker para facilitar o desenvolvimento e deployment.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação da API
- **Swagger** - Documentação interativa da API

### Bancos de Dados
- **PostgreSQL** - Dados relacionais (usuários, reservas, espaços)
- **MongoDB** - Dados não-relacionais (logs do sistema)

### Frontend
- **Express-Handlebars** - Template engine para interface web
- **HTML/CSS/JavaScript** - Interface responsiva

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de contêineres
- **Environment Variables** - Configuração segura

## 🐳 Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

*Não é necessário instalar Node.js, PostgreSQL ou MongoDB localmente - tudo roda em contêineres!*

## ⚡ Como Rodar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/oguarni/web-2.git
cd web-2
```

### 2. Crie o arquivo de ambiente
```bash
cp .env.example .env
```
*Os valores padrão no `.env.example` já estão configurados para funcionar com o Docker Compose.*

### 3. Suba os contêineres
```bash
docker-compose up --build
```

### 4. Acesse as aplicações
- **Interface Web:** [http://localhost:8081](http://localhost:8081)
- **API REST:** [http://localhost:8081/api](http://localhost:8081/api)
- **Documentação da API (Swagger):** [http://localhost:8081/api/docs](http://localhost:8081/api/docs)

### 5. Teste a API (Opcional)
```bash
chmod +x teste_api.sh
./teste_api.sh
```

## 📁 Estrutura do Projeto

```
sistema-reservas-espacos/
├── 🐳 docker-compose.yml      # Orquestração dos contêineres
├── 🐳 Dockerfile             # Imagem da aplicação
├── 📄 .env.example           # Exemplo de configuração
├── 📄 package.json           # Dependências Node.js
├── 📄 app.js                 # Arquivo principal da aplicação
├── 📂 config/                # Configurações dos bancos
│   ├── db_sequelize.js       # PostgreSQL
│   ├── db_mongoose.js        # MongoDB
│   └── swagger.js            # Documentação API
├── 📂 controllers/           # Lógica de negócio
│   ├── api/                  # Controllers da API REST
│   └── web/                  # Controllers da interface web
├── 📂 middlewares/           # Middlewares customizados
├── 📂 models/                # Modelos de dados
│   ├── relational/           # Sequelize (PostgreSQL)
│   └── noSql/                # Mongoose (MongoDB)
├── 📂 routers/               # Definição de rotas
├── 📂 views/                 # Templates Handlebars
└── 📂 public/                # Arquivos estáticos
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente (.env)
```env
# Base de Dados PostgreSQL
POSTGRES_DB=web2_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/logs_db

# Aplicação
PORT=8081
NODE_ENV=development
SESSION_SECRET=your-session-secret-here
JWT_SECRET=sua-chave-secreta-super-segura
```

### Comandos Docker Úteis

**Parar os contêineres:**
```bash
docker-compose down
```

**Reconstruir apenas a aplicação:**
```bash
docker-compose up --build app
```

**Ver logs da aplicação:**
```bash
docker-compose logs app
```

**Limpar volumes (resetar dados):**
```bash
docker-compose down -v
```

**Executar comandos dentro do contêiner:**
```bash
docker-compose exec app npm test
```

## 📚 Requisitos Acadêmicos Atendidos

### ✅ NodeJS + Express
- **Framework Express** configurado em `app.js`
- **Servidor web** rodando na porta configurável
- **Estrutura MVC** com controllers, models e views separados
- **Middlewares customizados** para autenticação e validação

### ✅ Rotas NodeJS
- **Rotas organizadas** em módulos (`routers/api.js`, `routers/web/`)
- **Controladores separados** para cada entidade
- **Middleware de autenticação** aplicado nas rotas protegidas
- **Estrutura RESTful** seguindo convenções

### ✅ Parâmetros em Rotas
- **Route parameters**: `/api/usuarios/:id`, `/api/espacos/:id`
- **Query parameters**: `/api/espacos?ativo=true&capacidade=10`
- **Body parameters**: Todos os endpoints POST/PUT recebem dados via `req.body`
- **Parameter validation**: Middlewares de validação para todos os parâmetros

### ✅ Métodos HTTP POST e GET
- **GET**: Listagem e consulta de recursos
- **POST**: Criação de novos recursos
- **PUT**: Atualização de recursos
- **DELETE**: Remoção de recursos

### ✅ MongoDB + Compass + Atlas
- **MongoDB** rodando em contêiner Docker
- **Collection de logs** para auditoria
- **Mongoose ODM** para modelagem NoSQL
- **Compatível com MongoDB Compass**

### ✅ NodeJS + Sequelize
- **Sequelize ORM** com PostgreSQL
- **Modelos relacionais** com relacionamentos 1:N e N:N
- **Sincronização automática** de tabelas
- **35+ colunas** distribuídas em 5 tabelas

## 👥 Usuários Padrão

O sistema cria automaticamente usuários padrão na primeira execução:

| Tipo | Login | Senha | Permissões |
|------|-------|-------|------------|
| **Admin** | `admin` | `admin123` | ✅ Acesso total ao sistema |
| **Usuário** | `usuario` | `usuario123` | ✅ Criar e gerenciar próprias reservas |
| **Gestor** | `gestor` | `gestor123` | ✅ Gerenciar espaços e reservas |

## 🌐 Usando a API

### 1. Autenticação
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "senha": "admin123"}'
```

### 2. Listar espaços disponíveis
```bash
curl -X GET http://localhost:8081/api/espacos \
  -H "Authorization: Bearer <token>"
```

### 3. Criar nova reserva
```bash
curl -X POST http://localhost:8081/api/reservas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Reunião de Equipe",
    "dataInicio": "2025-01-15T09:00:00.000Z",
    "dataFim": "2025-01-15T11:00:00.000Z",
    "espacoId": 1,
    "descricao": "Reunião semanal da equipe"
  }'
```

## 🔒 Segurança

### Interface Web
- **Autenticação**: Sistema de login com sessões Express
- **Autorização**: Middlewares para controle de acesso por tipo de usuário
- **Validação**: Verificação de conflitos de reservas

### API REST
- **JWT Authentication**: Tokens seguros com expiração
- **Controle de Acesso**: Middleware baseado em perfis de usuário
- **Validação**: Sanitização e validação de dados de entrada
- **CORS**: Configurado para desenvolvimento e produção

## ✨ Funcionalidades

### Interface Web
- ✅ **Login/Logout** seguro com sessões
- ✅ **Dashboard** personalizado por tipo de usuário
- ✅ **CRUD de Reservas** com validação de conflitos
- ✅ **Gerenciamento de Espaços** (gestores/admins)
- ✅ **Sistema de Logs** completo (admins)
- ✅ **Cadastro público** de usuários

### API REST
- ✅ **Autenticação JWT** com refresh tokens
- ✅ **CRUD completo** para todas as entidades
- ✅ **Verificação de disponibilidade** de espaços
- ✅ **Paginação e filtros** avançados
- ✅ **Documentação interativa** com Swagger
- ✅ **Logs de auditoria** detalhados

## 🎯 Demonstração e Testes

### Script de Teste da API
```bash
./teste_api.sh
```

### Validação dos Requisitos
```bash
docker-compose exec app npm test
```

### Demonstração Completa
```bash
docker-compose exec app node demo_requisitos.js
```

## 📊 Modelagem de Dados

### PostgreSQL (Relacional)
```
Usuario (1) -----> (N) Reserva
Espaco (1) -----> (N) Reserva
Espaco (N) <---> (N) Amenity [através de EspacoAmenity]
```

**5 Tabelas com 35+ Colunas:**
- **Usuario**: id, nome, login, senha, tipo, createdAt, updatedAt
- **Reserva**: id, titulo, dataInicio, dataFim, descricao, status, usuarioId, espacoId, createdAt, updatedAt
- **Espaco**: id, nome, descricao, capacidade, localizacao, equipamentos, ativo, createdAt, updatedAt
- **Amenity**: id, nome, descricao, createdAt, updatedAt
- **EspacoAmenity**: id, espacoId, amenityId, createdAt, updatedAt

### MongoDB (NoSQL)
**Collection Logs:**
- usuarioId, acao, timestamp, ip, detalhes, _id

## 🐛 Solução de Problemas

### Contêineres não sobem
```bash
docker-compose down -v
docker-compose up --build
```

### Erro de permissão no script de teste
```bash
chmod +x teste_api.sh
```

### Banco de dados não conecta
```bash
docker-compose logs postgres
docker-compose logs mongodb
```

### Aplicação não responde
```bash
docker-compose logs app
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Gabriel Felipe Guarnieri**

---

## 🏆 Status do Projeto

- ✅ **Etapa 1**: Interface web com MVC
- ✅ **Etapa 2**: Integração com bancos de dados
- ✅ **Etapa 3**: API REST com autenticação JWT
- ✅ **Etapa 4**: Containerização com Docker
- ✅ **Projeto acadêmico completo!**

⭐ Se este projeto te ajudou, considere dar uma estrela!

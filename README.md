# Sistema de Reservas de Espaços

Sistema simples para gerenciamento de reservas de espaços, desenvolvido com Node.js, Express e PostgreSQL seguindo a arquitetura MVC.

## Funcionalidades

- Sistema de autenticação de usuários (login/logout)
- Dois tipos de usuário:
  - **Administrador (tipo 1)**: acesso total ao sistema, pode gerenciar usuários e visualizar/gerenciar todas as reservas
  - **Usuário Comum (tipo 2)**: acesso limitado às próprias reservas, pode criar, visualizar, editar e excluir apenas suas reservas
- Gerenciamento de reservas com datas de início e fim
- Verificação de conflitos de horários para evitar reservas duplicadas
- Gestão de status das reservas (pendente, confirmada, cancelada)
- Sistema de logs usando MongoDB para rastrear atividades dos usuários

## Estrutura do Projeto

O projeto segue o padrão arquitetural MVC (Model-View-Controller):

- **Models**: 
  - **Relacional (PostgreSQL)**: Usuario e Reserva
  - **NoSQL (MongoDB)**: Log
- **Views**: Telas de interface usando Handlebars
- **Controllers**: Lógica de negócio para manipulação dos dados
- **Middlewares**: Sistema de controle de autenticação e autorização

## Relacionamentos

Implementação do relacionamento 1:N entre Usuario e Reserva:
- Um usuário pode ter várias reservas (1:N)

## Instalação

1. Clone o repositório
2. Instale as dependências: npm install
3. Configure o banco de dados PostgreSQL em `config/db_sequelize.js`
4. Configure o banco de dados MongoDB em `config/db_mongoose.js`
5. Para primeira execução, descomente o código de criação de tabelas em `routers/route.js`

## Execução
npm start
Acesse http://localhost:8081 no navegador

## Usuários Pré-configurados

- **Administrador**:
  - Login: admin
  - Senha: 1234
  - Tipo: 1 (Acesso total)

- **Usuário Comum**:
  - Login: usuario
  - Senha: 1234
  - Tipo: 2 (Acesso limitado)

## Tecnologias

- Node.js
- Express
- Sequelize (ORM para PostgreSQL)
- PostgreSQL (dados relacionais - usuários e reservas)
- Mongoose (ODM para MongoDB)
- MongoDB (dados não relacionais - logs do sistema)
- Express-Handlebars (Template Engine)
- Express-Session (Gerenciamento de sessões)

## Autor

Gabriel Felipe Guarnieri
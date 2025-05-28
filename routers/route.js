const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerReserva = require('../controllers/controllerReserva');
const controllerEspaco = require('../controllers/controllerEspaco');
const controllerRecurso = require('../controllers/controllerRecurso');
const controllerLog = require('../controllers/controllerLog');
const { isAuthenticated, isAdmin, isOwnerOrAdmin } = require('../middlewares/auth');
const route = express.Router();

// Cria as tabelas no banco de dados - descomentar para a primeira execução
/*
db.sequelize.sync({force: true}).then(async () => {
    console.log('{ force: true }');
    
    // Criar usuários padrão
    const admin = await db.Usuario.create({
        nome: 'Administrador',
        login: 'admin',
        senha: '1234',
        tipo: 1,
        email: 'admin@sistema.com',
        telefone: '(00) 00000-0000'
    });
    
    const usuario = await db.Usuario.create({
        nome: 'Usuário',
        login: 'usuario',
        senha: '1234',
        tipo: 2,
        email: 'usuario@sistema.com',
        telefone: '(00) 00000-0001'
    });
    
    // Criar espaços
    const sala1 = await db.Espaco.create({
        nome: 'Sala de Reunião 1',
        descricao: 'Sala com capacidade para 10 pessoas',
        capacidade: 10,
        tipo: 'sala'
    });
    
    const auditorio = await db.Espaco.create({
        nome: 'Auditório Principal',
        descricao: 'Auditório com projetor e sistema de som',
        capacidade: 100,
        tipo: 'auditorio'
    });
    
    const quadra = await db.Espaco.create({
        nome: 'Quadra Poliesportiva',
        descricao: 'Quadra coberta para diversos esportes',
        capacidade: 20,
        tipo: 'quadra'
    });
    
    // Criar recursos
    const projetor = await db.Recurso.create({
        nome: 'Projetor',
        descricao: 'Projetor Full HD',
        quantidade: 5
    });
    
    const microfone = await db.Recurso.create({
        nome: 'Microfone',
        descricao: 'Microfone sem fio',
        quantidade: 10
    });
    
    const notebook = await db.Recurso.create({
        nome: 'Notebook',
        descricao: 'Notebook para apresentações',
        quantidade: 3
    });
    
    // Criar uma reserva exemplo
    const reserva = await db.Reserva.create({
        titulo: 'Reunião de Planejamento',
        dataInicio: new Date('2025-06-01T14:00:00'),
        dataFim: new Date('2025-06-01T16:00:00'),
        descricao: 'Reunião mensal de planejamento',
        status: 'confirmada',
        usuarioId: usuario.id,
        espacoId: sala1.id
    });
    
    // Adicionar recursos à reserva (N:N)
    await db.ReservaRecurso.create({
        reservaId: reserva.id,
        recursoId: projetor.id,
        quantidade: 1
    });
    
    await db.ReservaRecurso.create({
        reservaId: reserva.id,
        recursoId: notebook.id,
        quantidade: 1
    });
    
    console.log('Dados iniciais criados com sucesso!');
});
*/

module.exports = route;

// Home
route.get("/", controllerUsuario.getLogin);
route.get("/home", isAuthenticated, function(req, res) { 
    res.render('home') 
});

// Controller Usuario - Login/Logout
route.post("/login", controllerUsuario.postLogin);
route.get("/logout", controllerUsuario.getLogout);

// Controller Usuario - CRUD (apenas admin)
route.get("/usuarioCreate", isAuthenticated, isAdmin, controllerUsuario.getCreate);
route.post("/usuarioCreate", isAuthenticated, isAdmin, controllerUsuario.postCreate);
route.get("/usuarioList", isAuthenticated, isAdmin, controllerUsuario.getList);
route.get("/usuarioUpdate/:id", isAuthenticated, isAdmin, controllerUsuario.getUpdate);
route.post("/usuarioUpdate", isAuthenticated, isAdmin, controllerUsuario.postUpdate);
route.get("/usuarioDelete/:id", isAuthenticated, isAdmin, controllerUsuario.getDelete);

// Controller Espaço - CRUD (apenas admin)
route.get("/espacoCreate", isAuthenticated, isAdmin, controllerEspaco.getCreate);
route.post("/espacoCreate", isAuthenticated, isAdmin, controllerEspaco.postCreate);
route.get("/espacoList", isAuthenticated, isAdmin, controllerEspaco.getList);
route.get("/espacoUpdate/:id", isAuthenticated, isAdmin, controllerEspaco.getUpdate);
route.post("/espacoUpdate", isAuthenticated, isAdmin, controllerEspaco.postUpdate);
route.get("/espacoDelete/:id", isAuthenticated, isAdmin, controllerEspaco.getDelete);
route.post("/espacoDelete", isAuthenticated, isAdmin, controllerEspaco.postDelete);

// Controller Recurso - CRUD (apenas admin)
route.get("/recursoCreate", isAuthenticated, isAdmin, controllerRecurso.getCreate);
route.post("/recursoCreate", isAuthenticated, isAdmin, controllerRecurso.postCreate);
route.get("/recursoList", isAuthenticated, isAdmin, controllerRecurso.getList);
route.get("/recursoUpdate/:id", isAuthenticated, isAdmin, controllerRecurso.getUpdate);
route.post("/recursoUpdate", isAuthenticated, isAdmin, controllerRecurso.postUpdate);
route.get("/recursoDelete/:id", isAuthenticated, isAdmin, controllerRecurso.getDelete);
route.post("/recursoDelete", isAuthenticated, isAdmin, controllerRecurso.postDelete);
route.get("/api/recurso/disponibilidade", isAuthenticated, controllerRecurso.checkDisponibilidade);

// Controller Reserva - CRUD
route.get("/reservaCreate", isAuthenticated, controllerReserva.getCreate);
route.post("/reservaCreate", isAuthenticated, controllerReserva.postCreate);
route.get("/reservaList", isAuthenticated, controllerReserva.getList);
route.get("/reservaUpdate/:id", isAuthenticated, isOwnerOrAdmin, controllerReserva.getUpdate);
route.post("/reservaUpdate", isAuthenticated, isOwnerOrAdmin, controllerReserva.postUpdate);
route.get("/reservaDelete/:id", isAuthenticated, isOwnerOrAdmin, controllerReserva.getDelete);
route.post("/reservaDelete", isAuthenticated, isOwnerOrAdmin, controllerReserva.postDelete);
route.get("/reservaChangeStatus/:id/:status", isAuthenticated, isAdmin, controllerReserva.getChangeStatus);

// Controller Log - List (apenas admin)
route.get("/logList", isAuthenticated, isAdmin, controllerLog.getList);
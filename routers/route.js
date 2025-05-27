const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerReserva = require('../controllers/controllerReserva');
const controllerLog = require('../controllers/controllerLog');
const { isAuthenticated, isAdmin, isOwnerOrAdmin } = require('../middlewares/auth');
const route = express.Router();

// Cria as tabelas no banco de dados - descomentar para a primeira execução
/*
db.sequelize.sync({force: true}).then(() => {
    console.log('{ force: true }');
    
    // Criar usuário administrador padrão
    db.Usuario.create({
        nome: 'Administrador',
        login: 'admin',
        senha: '1234',
        tipo: 1 // 1 = admin
    });
    
    // Criar usuário comum padrão
    db.Usuario.create({
        nome: 'Usuário',
        login: 'usuario',
        senha: '1234',
        tipo: 2 // 2 = usuário comum
    });
});
*/

module.exports = route;

// Home
route.get("/home", isAuthenticated, function(req, res) { 
    res.render('home') 
});

// Controller Usuario - Login/Logout
route.get("/", controllerUsuario.getLogin);
route.post("/login", controllerUsuario.postLogin);
route.get("/logout", controllerUsuario.getLogout);

// Controller Usuario - CRUD (apenas admin)
route.get("/usuarioCreate", isAuthenticated, isAdmin, controllerUsuario.getCreate);
route.post("/usuarioCreate", isAuthenticated, isAdmin, controllerUsuario.postCreate);
route.get("/usuarioList", isAuthenticated, isAdmin, controllerUsuario.getList);
route.get("/usuarioUpdate/:id", isAuthenticated, isAdmin, controllerUsuario.getUpdate);
route.post("/usuarioUpdate", isAuthenticated, isAdmin, controllerUsuario.postUpdate);
route.get("/usuarioDelete/:id", isAuthenticated, isAdmin, controllerUsuario.getDelete);

// Controller Reserva (todos podem criar reservas, mas só podem ver/editar as próprias - admin vê todas)
route.get("/reservaCreate", isAuthenticated, controllerReserva.getCreate);
route.post("/reservaCreate", isAuthenticated, controllerReserva.postCreate);
route.get("/reservaList", isAuthenticated, controllerReserva.getList);
route.get("/reservaUpdate/:id", isAuthenticated, isOwnerOrAdmin, controllerReserva.getUpdate);
route.post("/reservaUpdate", isAuthenticated, isOwnerOrAdmin, controllerReserva.postUpdate);
route.get("/reservaDelete/:id", isAuthenticated, isOwnerOrAdmin, controllerReserva.getDelete);
route.get("/reservaChangeStatus/:id/:status", isAuthenticated, isAdmin, controllerReserva.getChangeStatus);

// Controller Log (apenas admin)
route.get("/logList", isAuthenticated, isAdmin, controllerLog.getList);
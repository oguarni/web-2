const db = require('../config/db_sequelize');
const controllerLog = require('./controllerLog');
const path = require('path');

module.exports = {
    // Login page
    async getLogin(req, res) {
        res.render('usuario/login', { layout: 'noMenu.handlebars' });
    },
    
    // Process login
    async postLogin(req, res) {
        db.Usuario.findOne({ 
            where: { 
                login: req.body.login, 
                senha: req.body.senha 
            } 
        }).then(usuario => {
            if (usuario) {
                // Save user information in session
                req.session.userId = usuario.id;
                req.session.userName = usuario.nome;
                req.session.userLogin = usuario.login;
                req.session.userType = usuario.tipo;
                
                // Registrar log de login
                controllerLog.registrarLog(
                    usuario.id,
                    'login',
                    req.ip,
                    { userAgent: req.headers['user-agent'] }
                );
                
                res.redirect('/home');
            } else {
                res.render('usuario/login', { 
                    layout: 'noMenu.handlebars',
                    erro: 'Login ou senha incorretos!' 
                });
            }
        }).catch((err) => {
            console.log(err);
            res.redirect('/');
        });
    },
    
    // Logout
    async getLogout(req, res) {
        req.session.destroy();
        res.redirect('/');
    },
    
    // Create user form
    async getCreate(req, res) {
        res.render('usuario/usuarioCreate');
    },
    
    // Process user creation
    async postCreate(req, res) {
        db.Usuario.create({
            nome: req.body.nome,
            login: req.body.login,
            senha: req.body.senha,
            tipo: req.body.tipo || 2 // Default is normal user
        }).then(() => {
            res.redirect('/usuarioList');
        }).catch((err) => {
            console.log(err);
            res.redirect('/usuarioCreate');
        });
    },
    
    // List all users
    async getList(req, res) {
        db.Usuario.findAll().then(usuarios => {
            res.render('usuario/usuarioList', { 
                usuarios: usuarios.map(user => user.toJSON()) 
            });
        }).catch((err) => {
            console.log(err);
            res.redirect('/home');
        });
    },
    
    // Edit user form
    async getUpdate(req, res) {
        await db.Usuario.findByPk(req.params.id).then(
            usuario => res.render('usuario/usuarioUpdate', { 
                usuario: usuario.dataValues 
            })
        ).catch(function(err) {
            console.log(err);
            res.redirect('/usuarioList');
        });
    },
    
    // Process user update
    async postUpdate(req, res) {
        await db.Usuario.update(req.body, { 
            where: { id: req.body.id }
        }).then(() => {
            res.redirect('/usuarioList');
        }).catch(function(err) {
            console.log(err);
            res.redirect('/usuarioUpdate/' + req.body.id);
        });
    },
    
    // Delete user
    async getDelete(req, res) {
        await db.Usuario.destroy({ 
            where: { id: req.params.id }
        }).then(() => {
            res.redirect('/usuarioList');
        }).catch(err => {
            console.log(err);
            res.redirect('/usuarioList');
        });
    }
}
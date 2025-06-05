const db = require('../../config/db_sequelize');
const { createToken } = require('../../middlewares/tokenAuth');
const controllerLog = require('../controllerLog');

module.exports = {
    // POST /api/auth/login
    async login(req, res) {
        try {
            const { login, senha } = req.body;
            
            if (!login || !senha) {
                return res.status(400).json({
                    error: 'Login and password are required'
                });
            }
            
            const usuario = await db.Usuario.findOne({ 
                where: { login, senha } 
            });
            
            if (!usuario) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }
            
            // Create token
            const token = createToken(usuario.id, usuario.tipo);
            
            // Log login attempt
            controllerLog.registrarLog(
                usuario.id,
                'api_login',
                req.ip,
                { userAgent: req.headers['user-agent'] }
            );
            
            res.json({
                success: true,
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    login: usuario.login,
                    tipo: usuario.tipo
                }
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
};
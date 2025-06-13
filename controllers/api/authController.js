const db = require('../../config/db_sequelize');
const { createToken } = require('../../middlewares/tokenAuth');
const { asyncHandler, UnauthorizedError } = require('../../middlewares/errorHandler');

module.exports = {
    // POST /api/auth/login
    login: asyncHandler(async (req, res) => {
        const { login, senha } = req.body;
        
        const usuario = await db.Usuario.findOne({ 
            where: { login, senha } 
        });
        
        if (!usuario) {
            throw new UnauthorizedError('Invalid credentials');
        }
        
        // Create token
        const token = createToken(usuario.id, usuario.tipo);
        
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
    })
};
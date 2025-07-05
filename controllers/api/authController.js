const db = require('../../config/db_sequelize');
const jwt = require('jsonwebtoken');
const { asyncHandler, UnauthorizedError } = require('../../middlewares/errorHandler');

// Ensure JWT_SECRET is set in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';

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
        
        // Create JWT payload
        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo
        };

        // Sign the token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        
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

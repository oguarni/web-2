const db = require('../../config/db_sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { asyncHandler, UnauthorizedError } = require('../../middlewares/errorHandler');

// Ensure JWT_SECRET is set in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';

module.exports = {
    // POST /api/auth/login
    login: asyncHandler(async (req, res) => {
        const { login, senha } = req.body;
        
        const usuario = await db.Usuario.findOne({ 
            where: { login } 
        });
        
        if (!usuario) {
            throw new UnauthorizedError('Invalid credentials');
        }
        
        // Compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(senha, usuario.senha);
        if (!isPasswordValid) {
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
    }),

    // GET /api/auth/me
    me: asyncHandler(async (req, res) => {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                nome: req.user.nome,
                login: req.user.login,
                tipo: req.user.tipo
            }
        });
    })
};

const db = require('../../config/db_sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { asyncHandler, UnauthorizedError } = require('../../middlewares/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL_ERROR: JWT_SECRET is not defined in environment variables.');
}

module.exports = {
    // POST /api/auth/login
    login: asyncHandler(async (req, res) => {
        const { login, senha } = req.body;
        
        const user = await db.User.findOne({ 
            where: { login } 
        });
        
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }
        
        // Compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(senha, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }
        
        // Create JWT payload
        const payload = {
            id: user.id,
            name: user.name,
            tipo: user.type
        };

        // Sign the token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                login: user.login,
                type: user.type
            }
        });
    }),

    // GET /api/auth/me
    me: asyncHandler(async (req, res) => {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                login: req.user.login,
                type: req.user.tipo
            }
        });
    })
};

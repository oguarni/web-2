const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /api/usuarios
    index: asyncHandler(async (req, res) => {
        const usuarios = await db.Usuario.findAll({
            attributes: ['id', 'nome', 'login', 'tipo', 'createdAt', 'updatedAt']
        });
        
        res.json({
            success: true,
            data: usuarios
        });
    }),
    
    // GET /api/usuarios/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const usuario = await db.Usuario.findByPk(id, {
            attributes: ['id', 'nome', 'login', 'tipo', 'createdAt', 'updatedAt']
        });
        
        if (!usuario) {
            throw new NotFoundError('User not found');
        }
        
        res.json({
            success: true,
            data: usuario
        });
    }),
    
    // POST /api/usuarios
    create: asyncHandler(async (req, res) => {
        const { nome, login, senha, tipo } = req.body;
        
        // Check if login already exists
        const existingUser = await db.Usuario.findOne({ where: { login } });
        if (existingUser) {
            throw new ConflictError('Login already exists');
        }
        
        const usuario = await db.Usuario.create({
            nome,
            login,
            senha,
            tipo: tipo || 2 // Default to normal user
        });
        
        res.status(201).json({
            success: true,
            data: {
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                tipo: usuario.tipo
            }
        });
    }),
    
    // PUT /api/usuarios/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nome, login, senha, tipo } = req.body;
        
        const usuario = await db.Usuario.findByPk(id);
        if (!usuario) {
            throw new NotFoundError('User not found');
        }
        
        // Check if new login already exists (excluding current user)
        if (login && login !== usuario.login) {
            const existingUser = await db.Usuario.findOne({ 
                where: { login, id: { [db.Sequelize.Op.ne]: id } } 
            });
            if (existingUser) {
                throw new ConflictError('Login already exists');
            }
        }
        
        await usuario.update({
            nome: nome || usuario.nome,
            login: login || usuario.login,
            senha: senha || usuario.senha,
            tipo: tipo !== undefined ? tipo : usuario.tipo
        });
        
        res.json({
            success: true,
            data: {
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                tipo: usuario.tipo
            }
        });
    }),
    
    // DELETE /api/usuarios/:id
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const usuario = await db.Usuario.findByPk(id);
        if (!usuario) {
            throw new NotFoundError('User not found');
        }
        
        // Prevent self-deletion
        if (parseInt(id) === req.user.id) {
            throw new ValidationError('Cannot delete your own account');
        }
        
        await usuario.destroy();
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    })
};
const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError, ForbiddenError } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /api/usuarios
    index: asyncHandler(async (req, res) => {
        const users = await db.User.findAll({
            attributes: ['id', 'name', 'login', 'type', 'createdAt', 'updatedAt']
        });
        
        res.json({
            success: true,
            data: users
        });
    }),
    
    // GET /api/usuarios/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const user = await db.User.findByPk(id, {
            attributes: ['id', 'name', 'login', 'type', 'createdAt', 'updatedAt']
        });
        
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        res.json({
            success: true,
            data: user
        });
    }),
    
    // POST /api/usuarios
    create: asyncHandler(async (req, res) => {
        const { name, login, password, type } = req.body;
        
        // Check if login already exists
        const existingUser = await db.User.findOne({ where: { login } });
        if (existingUser) {
            throw new ConflictError('Login already exists');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await db.User.create({
            name,
            login,
            password: hashedPassword,
            type: type || 2 // Default to normal user
        });
        
        const { password: _, ...userData } = user.get({ plain: true });

        res.status(201).json({
            success: true,
            data: userData
        });
    }),
    
    // PUT /api/usuarios/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, login, password, type } = req.body;
        
        const user = await db.User.findByPk(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        // Check if new login already exists (excluding current user)
        if (login && login !== user.login) {
            const existingUser = await db.User.findOne({ 
                where: { login, id: { [db.Sequelize.Op.ne]: id } } 
            });
            if (existingUser) {
                throw new ConflictError('Login already exists');
            }
        }
        
        // Prevent admin from changing their own role
        if (parseInt(id) === req.user.id && req.user.tipo === 1 && type !== undefined && type !== 1) {
            throw new ForbiddenError('Admins cannot revoke their own privileges or delete their own account.');
        }
        
        await user.update({
            name: name || user.name,
            login: login || user.login,
            password: password || user.password,
            type: type !== undefined ? type : user.type
        });
        
        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                login: user.login,
                type: user.type
            }
        });
    }),
    
    // DELETE /api/usuarios/:id
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const user = await db.User.findByPk(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        // Prevent self-deletion
        if (parseInt(id) === req.user.id) {
            throw new ForbiddenError('Admins cannot revoke their own privileges or delete their own account.');
        }
        
        // Check for associated reservations
        const reservationsCount = await db.Reservation.count({
            where: { userId: id }
        });
        
        if (reservationsCount > 0) {
            throw new ConflictError(
                "Cannot delete user. Please reassign or delete their active reservations first."
            );
        }
        
        await user.destroy();
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    })
};
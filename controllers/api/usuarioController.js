const db = require('../../config/db_sequelize');

module.exports = {
    // GET /api/usuarios
    async index(req, res) {
        try {
            const usuarios = await db.Usuario.findAll({
                attributes: ['id', 'nome', 'login', 'tipo', 'createdAt', 'updatedAt']
            });
            
            res.json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                error: 'Failed to fetch users'
            });
        }
    },
    
    // GET /api/usuarios/:id
    async show(req, res) {
        try {
            const { id } = req.params;
            
            const usuario = await db.Usuario.findByPk(id, {
                attributes: ['id', 'nome', 'login', 'tipo', 'createdAt', 'updatedAt']
            });
            
            if (!usuario) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({
                error: 'Failed to fetch user'
            });
        }
    },
    
    // POST /api/usuarios
    async create(req, res) {
        try {
            const { nome, login, senha, tipo } = req.body;
            
            if (!nome || !login || !senha) {
                return res.status(400).json({
                    error: 'Name, login and password are required'
                });
            }
            
            // Check if login already exists
            const existingUser = await db.Usuario.findOne({ where: { login } });
            if (existingUser) {
                return res.status(409).json({
                    error: 'Login already exists'
                });
            }
            
            const usuario = await db.Usuario.create({
                nome,
                login,
                senha,
                tipo: tipo || 2 // Default to normal user
            });
            
            // Log user creation
            
            res.status(201).json({
                success: true,
                data: {
                    id: usuario.id,
                    nome: usuario.nome,
                    login: usuario.login,
                    tipo: usuario.tipo
                }
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                error: 'Failed to create user'
            });
        }
    },
    
    // PUT /api/usuarios/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, login, senha, tipo } = req.body;
            
            const usuario = await db.Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            // Check if new login already exists (excluding current user)
            if (login && login !== usuario.login) {
                const existingUser = await db.Usuario.findOne({ 
                    where: { login, id: { [db.Sequelize.Op.ne]: id } } 
                });
                if (existingUser) {
                    return res.status(409).json({
                        error: 'Login already exists'
                    });
                }
            }
            
            await usuario.update({
                nome: nome || usuario.nome,
                login: login || usuario.login,
                senha: senha || usuario.senha,
                tipo: tipo !== undefined ? tipo : usuario.tipo
            });
            
            // Log user update
            
            res.json({
                success: true,
                data: {
                    id: usuario.id,
                    nome: usuario.nome,
                    login: usuario.login,
                    tipo: usuario.tipo
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                error: 'Failed to update user'
            });
        }
    },
    
    // DELETE /api/usuarios/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const usuario = await db.Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            // Prevent self-deletion
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({
                    error: 'Cannot delete your own account'
                });
            }
            
            await usuario.destroy();
            
            // Log user deletion
            
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                error: 'Failed to delete user'
            });
        }
    }
};
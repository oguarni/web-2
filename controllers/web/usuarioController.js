const { asyncHandler } = require('../../middlewares/errorHandler');
const bcrypt = require('bcryptjs');

module.exports = {
    // GET /usuarios
    index: asyncHandler(async (req, res) => {
        const database = req.app.get('db');
        const usuarios = await database.User.findAll({
            attributes: ['id', 'name', 'login', 'type', 'createdAt', 'updatedAt']
        });
        
        res.render('users/index', {
            title: 'Usuários',
            usuarios
        });
    }),

    // GET /usuarios/new
    new: asyncHandler(async (req, res) => {
        res.render('users/new', {
            title: 'Novo Usuário'
        });
    }),

    // POST /usuarios
    create: asyncHandler(async (req, res) => {
        const { name, login, password, type } = req.body;
        
        if (!name || !login || !password) {
            req.flash('error', 'Nome, login e senha são obrigatórios');
            return res.redirect('/usuarios/new');
        }

        try {
            const database = req.app.get('db');
            const existingUser = await database.User.findOne({ where: { login } });
            if (existingUser) {
                req.flash('error', 'Login já existe');
                return res.redirect('/usuarios/new');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            await database.User.create({
                name,
                login,
                password: hashedPassword,
                type: type || 2
            });

            req.flash('success', 'Usuário criado com sucesso');
            res.redirect('/web/usuarios');
        } catch (error) {
            req.flash('error', 'Erro ao criar usuário: ' + error.message);
            res.redirect('/usuarios/new');
        }
    }),

    // GET /usuarios/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const database = req.app.get('db');
        
        const usuario = await database.User.findByPk(id, {
            attributes: ['id', 'name', 'login', 'type', 'createdAt', 'updatedAt']
        });
        
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado');
            return res.redirect('/web/usuarios');
        }
        
        res.render('users/show', {
            title: 'Detalhes do Usuário',
            usuario
        });
    }),

    // GET /usuarios/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const database = req.app.get('db');
        
        const usuario = await database.User.findByPk(id, {
            attributes: ['id', 'name', 'login', 'type']
        });
        
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado');
            return res.redirect('/web/usuarios');
        }
        
        res.render('users/edit', {
            title: 'Editar Usuário',
            usuario
        });
    }),

    // PUT /usuarios/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, login, password, type } = req.body;
        
        try {
            const database = req.app.get('db');
            const usuario = await database.User.findByPk(id);
            if (!usuario) {
                req.flash('error', 'Usuário não encontrado');
                return res.redirect('/web/usuarios');
            }

            const updateData = { name, login, type };
            
            if (password && password.trim() !== '') {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await usuario.update(updateData);
            req.flash('success', 'Usuário atualizado com sucesso');
            res.redirect('/web/usuarios');
        } catch (error) {
            req.flash('error', 'Erro ao atualizar usuário: ' + error.message);
            res.redirect(`/usuarios/${id}/edit`);
        }
    }),

    // DELETE /usuarios/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        try {
            const database = req.app.get('db');
            const usuario = await database.User.findByPk(id);
            if (!usuario) {
                req.flash('error', 'Usuário não encontrado');
                return res.redirect('/web/usuarios');
            }

            await usuario.destroy();
            req.flash('success', 'Usuário removido com sucesso');
            res.redirect('/web/usuarios');
        } catch (error) {
            req.flash('error', 'Erro ao remover usuário: ' + error.message);
            res.redirect('/web/usuarios');
        }
    })
};
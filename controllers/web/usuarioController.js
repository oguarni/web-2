const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError } = require('../../middlewares/errorHandler');
const bcrypt = require('bcryptjs');

module.exports = {
    // GET /usuarios
    index: asyncHandler(async (req, res) => {
        const usuarios = await db.Usuario.findAll({
            attributes: ['id', 'nome', 'login', 'tipo', 'createdAt', 'updatedAt']
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
        const { nome, login, senha, tipo } = req.body;
        
        if (!nome || !login || !senha) {
            req.flash('error', 'Nome, login e senha são obrigatórios');
            return res.redirect('/usuarios/new');
        }

        try {
            const existingUser = await db.Usuario.findOne({ where: { login } });
            if (existingUser) {
                req.flash('error', 'Login já existe');
                return res.redirect('/usuarios/new');
            }

            const hashedPassword = await bcrypt.hash(senha, 10);
            
            await db.Usuario.create({
                nome,
                login,
                senha: hashedPassword,
                tipo: tipo || 2
            });

            req.flash('success', 'Usuário criado com sucesso');
            res.redirect('/usuarios');
        } catch (error) {
            req.flash('error', 'Erro ao criar usuário: ' + error.message);
            res.redirect('/usuarios/new');
        }
    }),

    // GET /usuarios/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const usuario = await db.Usuario.findByPk(id, {
            attributes: ['id', 'nome', 'login', 'tipo', 'createdAt', 'updatedAt']
        });
        
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado');
            return res.redirect('/usuarios');
        }
        
        res.render('users/show', {
            title: 'Detalhes do Usuário',
            usuario
        });
    }),

    // GET /usuarios/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const usuario = await db.Usuario.findByPk(id, {
            attributes: ['id', 'nome', 'login', 'tipo']
        });
        
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado');
            return res.redirect('/usuarios');
        }
        
        res.render('users/edit', {
            title: 'Editar Usuário',
            usuario
        });
    }),

    // PUT /usuarios/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nome, login, senha, tipo } = req.body;
        
        try {
            const usuario = await db.Usuario.findByPk(id);
            if (!usuario) {
                req.flash('error', 'Usuário não encontrado');
                return res.redirect('/usuarios');
            }

            const updateData = { nome, login, tipo };
            
            if (senha && senha.trim() !== '') {
                updateData.senha = await bcrypt.hash(senha, 10);
            }

            await usuario.update(updateData);
            req.flash('success', 'Usuário atualizado com sucesso');
            res.redirect('/usuarios');
        } catch (error) {
            req.flash('error', 'Erro ao atualizar usuário: ' + error.message);
            res.redirect(`/usuarios/${id}/edit`);
        }
    }),

    // DELETE /usuarios/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        try {
            const usuario = await db.Usuario.findByPk(id);
            if (!usuario) {
                req.flash('error', 'Usuário não encontrado');
                return res.redirect('/usuarios');
            }

            await usuario.destroy();
            req.flash('success', 'Usuário removido com sucesso');
            res.redirect('/usuarios');
        } catch (error) {
            req.flash('error', 'Erro ao remover usuário: ' + error.message);
            res.redirect('/usuarios');
        }
    })
};
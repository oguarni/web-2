const db = require('../../config/db_sequelize');
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /amenities
    index: asyncHandler(async (req, res) => {
        const amenities = await db.Amenity.findAll({
            include: [{
                model: db.Espaco,
                through: { attributes: [] },
                attributes: ['id', 'nome']
            }]
        });
        
        res.render('amenities/index', {
            title: 'Amenidades',
            amenities
        });
    }),

    // GET /amenities/new
    new: asyncHandler(async (req, res) => {
        res.render('amenities/new', {
            title: 'Nova Amenidade'
        });
    }),

    // POST /amenities
    create: asyncHandler(async (req, res) => {
        const { nome, descricao } = req.body;
        
        if (!nome) {
            req.flash('error', 'Nome é obrigatório');
            return res.redirect('/amenities/new');
        }

        try {
            await db.Amenity.create({
                nome,
                descricao
            });

            req.flash('success', 'Amenidade criada com sucesso');
            res.redirect('/amenities');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                req.flash('error', 'Já existe uma amenidade com este nome');
            } else {
                req.flash('error', 'Erro ao criar amenidade: ' + error.message);
            }
            res.redirect('/amenities/new');
        }
    }),

    // GET /amenities/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const amenity = await db.Amenity.findByPk(id, {
            include: [{
                model: db.Espaco,
                through: { attributes: [] },
                attributes: ['id', 'nome', 'localizacao']
            }]
        });
        
        if (!amenity) {
            req.flash('error', 'Amenidade não encontrada');
            return res.redirect('/amenities');
        }
        
        res.render('amenities/show', {
            title: 'Detalhes da Amenidade',
            amenity
        });
    }),

    // GET /amenities/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const amenity = await db.Amenity.findByPk(id);
        
        if (!amenity) {
            req.flash('error', 'Amenidade não encontrada');
            return res.redirect('/amenities');
        }
        
        res.render('amenities/edit', {
            title: 'Editar Amenidade',
            amenity
        });
    }),

    // PUT /amenities/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nome, descricao } = req.body;
        
        try {
            const amenity = await db.Amenity.findByPk(id);
            if (!amenity) {
                req.flash('error', 'Amenidade não encontrada');
                return res.redirect('/amenities');
            }

            await amenity.update({ nome, descricao });
            req.flash('success', 'Amenidade atualizada com sucesso');
            res.redirect('/amenities');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                req.flash('error', 'Já existe uma amenidade com este nome');
            } else {
                req.flash('error', 'Erro ao atualizar amenidade: ' + error.message);
            }
            res.redirect(`/amenities/${id}/edit`);
        }
    }),

    // DELETE /amenities/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        try {
            const amenity = await db.Amenity.findByPk(id);
            if (!amenity) {
                req.flash('error', 'Amenidade não encontrada');
                return res.redirect('/amenities');
            }

            await amenity.destroy();
            req.flash('success', 'Amenidade removida com sucesso');
            res.redirect('/amenities');
        } catch (error) {
            req.flash('error', 'Erro ao remover amenidade: ' + error.message);
            res.redirect('/amenities');
        }
    })
};
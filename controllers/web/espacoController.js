const db = require('../../config/db_sequelize');
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /espacos
    index: asyncHandler(async (req, res) => {
        const espacos = await db.Espaco.findAll({
            include: [{
                model: db.Amenity,
                through: { attributes: [] }
            }]
        });
        
        res.render('spaces/index', {
            title: 'Espaços',
            espacos
        });
    }),

    // GET /espacos/new
    new: asyncHandler(async (req, res) => {
        const amenities = await db.Amenity.findAll();
        res.render('spaces/new', {
            title: 'Novo Espaço',
            amenities
        });
    }),

    // POST /espacos
    create: asyncHandler(async (req, res) => {
        const { nome, descricao, capacidade, localizacao, equipamentos, ativo, amenities } = req.body;
        
        if (!nome || !capacidade || !localizacao) {
            req.flash('error', 'Nome, capacidade e localização são obrigatórios');
            return res.redirect('/espacos/new');
        }

        try {
            const espaco = await db.Espaco.create({
                nome,
                descricao,
                capacidade: parseInt(capacidade),
                localizacao,
                equipamentos,
                ativo: ativo === 'on'
            });

            // Associate amenities if provided
            if (amenities && Array.isArray(amenities)) {
                await espaco.setAmenities(amenities);
            }

            req.flash('success', 'Espaço criado com sucesso');
            res.redirect('/espacos');
        } catch (error) {
            req.flash('error', 'Erro ao criar espaço: ' + error.message);
            res.redirect('/espacos/new');
        }
    }),

    // GET /espacos/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const espaco = await db.Espaco.findByPk(id, {
            include: [{
                model: db.Amenity,
                through: { attributes: [] }
            }]
        });
        
        if (!espaco) {
            req.flash('error', 'Espaço não encontrado');
            return res.redirect('/espacos');
        }
        
        res.render('spaces/show', {
            title: 'Detalhes do Espaço',
            espaco
        });
    }),

    // GET /espacos/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const espaco = await db.Espaco.findByPk(id, {
            include: [{
                model: db.Amenity,
                through: { attributes: [] }
            }]
        });
        
        if (!espaco) {
            req.flash('error', 'Espaço não encontrado');
            return res.redirect('/espacos');
        }

        const amenities = await db.Amenity.findAll();
        
        res.render('spaces/edit', {
            title: 'Editar Espaço',
            espaco,
            amenities
        });
    }),

    // PUT /espacos/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nome, descricao, capacidade, localizacao, equipamentos, ativo, amenities } = req.body;
        
        try {
            const espaco = await db.Espaco.findByPk(id);
            if (!espaco) {
                req.flash('error', 'Espaço não encontrado');
                return res.redirect('/espacos');
            }

            await espaco.update({
                nome,
                descricao,
                capacidade: parseInt(capacidade),
                localizacao,
                equipamentos,
                ativo: ativo === 'on'
            });

            // Update amenities association
            if (amenities && Array.isArray(amenities)) {
                await espaco.setAmenities(amenities);
            } else {
                await espaco.setAmenities([]);
            }

            req.flash('success', 'Espaço atualizado com sucesso');
            res.redirect('/espacos');
        } catch (error) {
            req.flash('error', 'Erro ao atualizar espaço: ' + error.message);
            res.redirect(`/espacos/${id}/edit`);
        }
    }),

    // DELETE /espacos/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        try {
            const espaco = await db.Espaco.findByPk(id);
            if (!espaco) {
                req.flash('error', 'Espaço não encontrado');
                return res.redirect('/espacos');
            }

            await espaco.destroy();
            req.flash('success', 'Espaço removido com sucesso');
            res.redirect('/espacos');
        } catch (error) {
            req.flash('error', 'Erro ao remover espaço: ' + error.message);
            res.redirect('/espacos');
        }
    })
};
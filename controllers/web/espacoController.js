// Database will be accessed via req.app.get('db') to avoid module loading issues
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /espacos
    index: asyncHandler(async (req, res) => {
        const database = req.app.get('db');
        const espacos = await database.Space.findAll({
            include: [{
                model: database.Amenity,
                as: 'amenities',
                through: { attributes: [] }
            }]
        });
        
        res.render('spaces/index', {
            title: 'Espaços',
            espacos,
            user: req.session.user,
            isAuthenticated: true,
            isAdmin: req.session.user.type === 1,
            isGestor: req.session.user.type === 3,
            isAdminOrGestor: req.session.user.type === 1 || req.session.user.type === 3
        });
    }),

    // GET /espacos/new
    new: asyncHandler(async (req, res) => {
        const database = req.app.get('db');
        const amenities = await database.Amenity.findAll();
        res.render('spaces/new', {
            title: 'Novo Espaço',
            amenities,
            user: req.session.user,
            isAuthenticated: true,
            isAdmin: req.session.user.type === 1,
            isGestor: req.session.user.type === 3,
            isAdminOrGestor: req.session.user.type === 1 || req.session.user.type === 3
        });
    }),

    // POST /espacos
    create: asyncHandler(async (req, res) => {
        const { name, description, capacity, location, equipment, active, amenities } = req.body;
        
        if (!name || !capacity || !location) {
            req.session.error_msg = 'Nome, capacidade e localização são obrigatórios';
            return res.redirect('/web/espacos/new');
        }

        try {
            const database = req.app.get('db');
            const espaco = await database.Space.create({
                name: name,
                description: description,
                capacity: parseInt(capacity),
                location: location,
                equipment: equipment,
                active: active === 'on'
            });

            // Associate amenities if provided
            if (amenities && Array.isArray(amenities)) {
                await espaco.setAmenities(amenities);
            }

            req.session.success_msg = 'Espaço criado com sucesso';
            res.redirect('/web/espacos');
        } catch (error) {
            req.session.error_msg = 'Erro ao criar espaço: ' + error.message;
            res.redirect('/web/espacos/new');
        }
    }),

    // GET /espacos/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const database = req.app.get('db');
        
        const espaco = await database.Space.findByPk(id, {
            include: [{
                model: database.Amenity,
                as: 'amenities',
                through: { attributes: [] }
            }]
        });
        
        if (!espaco) {
            req.session.error_msg = 'Espaço não encontrado';
            return res.redirect('/web/espacos');
        }
        
        res.render('spaces/show', {
            title: 'Detalhes do Espaço',
            espaco,
            user: req.session.user,
            isAuthenticated: true,
            isAdmin: req.session.user.type === 1,
            isGestor: req.session.user.type === 3,
            isAdminOrGestor: req.session.user.type === 1 || req.session.user.type === 3
        });
    }),

    // GET /espacos/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const database = req.app.get('db');
        
        const espaco = await database.Space.findByPk(id, {
            include: [{
                model: database.Amenity,
                as: 'amenities',
                through: { attributes: [] }
            }]
        });
        
        if (!espaco) {
            req.session.error_msg = 'Espaço não encontrado';
            return res.redirect('/web/espacos');
        }
        
        const amenities = await database.Amenity.findAll();
        
        res.render('spaces/edit', {
            title: 'Editar Espaço',
            espaco,
            amenities,
            user: req.session.user,
            isAuthenticated: true,
            isAdmin: req.session.user.type === 1,
            isGestor: req.session.user.type === 3,
            isAdminOrGestor: req.session.user.type === 1 || req.session.user.type === 3
        });
    }),

    // PUT /espacos/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, capacity, location, equipment, active, amenities } = req.body;
        
        try {
            const database = req.app.get('db');
            const espaco = await database.Space.findByPk(id);
            if (!espaco) {
                req.session.error_msg = 'Espaço não encontrado';
                return res.redirect('/web/espacos');
            }

            await espaco.update({
                name: name,
                description: description,
                capacity: parseInt(capacity),
                location: location,
                equipment: equipment,
                active: active === 'on'
            });

            // Update amenities association
            if (amenities && Array.isArray(amenities)) {
                await espaco.setAmenities(amenities);
            } else {
                await espaco.setAmenities([]);
            }

            req.session.success_msg = 'Espaço atualizado com sucesso';
            res.redirect('/web/espacos');
        } catch (error) {
            req.session.error_msg = 'Erro ao atualizar espaço: ' + error.message;
            res.redirect(`/web/espacos/${id}/edit`);
        }
    }),

    // DELETE /espacos/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        try {
            const database = req.app.get('db');
            const espaco = await database.Space.findByPk(id);
            
            if (!espaco) {
                req.session.error_msg = 'Espaço não encontrado';
                return res.redirect('/web/espacos');
            }

            await espaco.destroy();
            req.session.success_msg = 'Espaço excluído com sucesso';
            res.redirect('/web/espacos');
        } catch (error) {
            req.session.error_msg = 'Erro ao excluir espaço: ' + error.message;
            res.redirect('/web/espacos');
        }
    })
};
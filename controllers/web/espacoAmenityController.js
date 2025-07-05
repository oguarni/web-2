const db = require('../../config/db_sequelize');
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /espaco-amenities
    index: asyncHandler(async (req, res) => {
        const espacoAmenities = await db.EspacoAmenity.findAll({
            include: [
                {
                    model: db.Espaco,
                    attributes: ['id', 'nome', 'localizacao']
                },
                {
                    model: db.Amenity,
                    attributes: ['id', 'nome', 'descricao']
                }
            ]
        });
        
        res.render('espaco-amenities/index', {
            title: 'Associações Espaço-Amenidade',
            espacoAmenities
        });
    }),

    // GET /espaco-amenities/new
    new: asyncHandler(async (req, res) => {
        const [espacos, amenities] = await Promise.all([
            db.Espaco.findAll({ where: { ativo: true } }),
            db.Amenity.findAll()
        ]);
        
        res.render('espaco-amenities/new', {
            title: 'Nova Associação',
            espacos,
            amenities
        });
    }),

    // POST /espaco-amenities
    create: asyncHandler(async (req, res) => {
        const { espacoId, amenityId } = req.body;
        
        if (!espacoId || !amenityId) {
            req.flash('error', 'Espaço e amenidade são obrigatórios');
            return res.redirect('/espaco-amenities/new');
        }

        try {
            // Check if association already exists
            const existingAssociation = await db.EspacoAmenity.findOne({
                where: { espacoId, amenityId }
            });

            if (existingAssociation) {
                req.flash('error', 'Esta associação já existe');
                return res.redirect('/espaco-amenities/new');
            }

            await db.EspacoAmenity.create({
                espacoId: parseInt(espacoId),
                amenityId: parseInt(amenityId)
            });

            req.flash('success', 'Associação criada com sucesso');
            res.redirect('/espaco-amenities');
        } catch (error) {
            req.flash('error', 'Erro ao criar associação: ' + error.message);
            res.redirect('/espaco-amenities/new');
        }
    }),

    // GET /espaco-amenities/:espacoId/:amenityId
    show: asyncHandler(async (req, res) => {
        const { espacoId, amenityId } = req.params;
        
        const espacoAmenity = await db.EspacoAmenity.findOne({
            where: { espacoId, amenityId },
            include: [
                {
                    model: db.Espaco,
                    attributes: ['id', 'nome', 'localizacao', 'capacidade']
                },
                {
                    model: db.Amenity,
                    attributes: ['id', 'nome', 'descricao']
                }
            ]
        });
        
        if (!espacoAmenity) {
            req.flash('error', 'Associação não encontrada');
            return res.redirect('/espaco-amenities');
        }
        
        res.render('espaco-amenities/show', {
            title: 'Detalhes da Associação',
            espacoAmenity
        });
    }),

    // DELETE /espaco-amenities/:espacoId/:amenityId
    destroy: asyncHandler(async (req, res) => {
        const { espacoId, amenityId } = req.params;
        
        try {
            const espacoAmenity = await db.EspacoAmenity.findOne({
                where: { espacoId, amenityId }
            });

            if (!espacoAmenity) {
                req.flash('error', 'Associação não encontrada');
                return res.redirect('/espaco-amenities');
            }

            await espacoAmenity.destroy();
            req.flash('success', 'Associação removida com sucesso');
            res.redirect('/espaco-amenities');
        } catch (error) {
            req.flash('error', 'Erro ao remover associação: ' + error.message);
            res.redirect('/espaco-amenities');
        }
    })
};
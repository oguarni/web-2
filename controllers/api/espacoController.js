const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /api/espacos
    index: asyncHandler(async (req, res) => {
        const { ativo } = req.query;
        let where = {};
        
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }
        
        const espacos = await db.Espaco.findAll({
            where,
            include: [{ model: db.Amenity, as: 'amenities' }],
            order: [['nome', 'ASC']]
        });
        
        res.json({
            success: true,
            data: espacos
        });
    }),
    
    // GET /api/espacos/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const espaco = await db.Espaco.findByPk(id, {
            include: [
                {
                    model: db.Reserva,
                    as: 'reservas',
                    attributes: ['id', 'titulo', 'dataInicio', 'dataFim', 'status'],
                    include: [
                        { model: db.Usuario, as: 'usuario', attributes: ['id', 'nome'] }
                    ]
                },
                { 
                    model: db.Amenity,
                    as: 'amenities',
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!espaco) {
            throw new NotFoundError('Space not found');
        }
        
        res.json({
            success: true,
            data: espaco
        });
    }),
    
    // POST /api/espacos
    create: asyncHandler(async (req, res) => {
        const { nome, descricao, capacidade, localizacao, equipamentos } = req.body;
        
        if (!nome || !capacidade || !localizacao) {
            throw new ValidationError('Name, capacity and location are required');
        }
        
        if (capacidade <= 0) {
            throw new ValidationError('Capacity must be greater than zero');
        }
        
        const existingSpace = await db.Espaco.findOne({ where: { nome } });
        if (existingSpace) {
            throw new ConflictError('Space name already exists');
        }
        
        const espaco = await db.Espaco.create({
            nome,
            descricao,
            capacidade,
            localizacao,
            equipamentos,
            ativo: true
        });
        
        res.status(201).json({
            success: true,
            data: espaco
        });
    }),
    
    // PUT /api/espacos/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nome, descricao, capacidade, localizacao, equipamentos, ativo } = req.body;
        
        const espaco = await db.Espaco.findByPk(id);
        if (!espaco) {
            throw new NotFoundError('Space not found');
        }
        
        if (nome && nome !== espaco.nome) {
            const existingSpace = await db.Espaco.findOne({ 
                where: { nome, id: { [db.Sequelize.Op.ne]: id } } 
            });
            if (existingSpace) {
                throw new ConflictError('Space name already exists');
            }
        }
        
        if (capacidade !== undefined && capacidade <= 0) {
            throw new ValidationError('Capacity must be greater than zero');
        }
        
        await espaco.update({
            nome: nome || espaco.nome,
            descricao: descricao !== undefined ? descricao : espaco.descricao,
            capacidade: capacidade || espaco.capacidade,
            localizacao: localizacao || espaco.localizacao,
            equipamentos: equipamentos !== undefined ? equipamentos : espaco.equipamentos,
            ativo: ativo !== undefined ? ativo : espaco.ativo
        });
        
        res.json({
            success: true,
            data: espaco
        });
    }),
    
    // DELETE /api/espacos/:id
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const espaco = await db.Espaco.findByPk(id);
        if (!espaco) {
            throw new NotFoundError('Space not found');
        }
        
        const activeReservations = await db.Reserva.count({
            where: {
                espacoId: id,
                status: ['confirmada', 'pendente'],
                dataFim: { [db.Sequelize.Op.gte]: new Date() }
            }
        });
        
        if (activeReservations > 0) {
            throw new ConflictError('Cannot delete space with active reservations');
        }
        
        await espaco.destroy();
        
        res.json({
            success: true,
            message: 'Space deleted successfully'
        });
    }),
    
    // GET /api/espacos/:id/disponibilidade
    checkAvailability: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { dataInicio, dataFim } = req.query;
        
        if (!dataInicio || !dataFim) {
            throw new ValidationError('Start date and end date are required');
        }
        
        const espaco = await db.Espaco.findByPk(id);
        if (!espaco || !espaco.ativo) {
            throw new NotFoundError('Space not found or inactive');
        }
        
        const conflictingReservations = await db.Reserva.findAll({
            where: {
                espacoId: id,
                status: 'confirmada',
                [db.Sequelize.Op.or]: [
                    {
                        dataInicio: {
                            [db.Sequelize.Op.between]: [dataInicio, dataFim]
                        }
                    },
                    {
                        dataFim: {
                            [db.Sequelize.Op.between]: [dataInicio, dataFim]
                        }
                    },
                    {
                        [db.Sequelize.Op.and]: [
                            { dataInicio: { [db.Sequelize.Op.lte]: dataInicio } },
                            { dataFim: { [db.Sequelize.Op.gte]: dataFim } }
                        ]
                    }
                ]
            },
            attributes: ['id', 'titulo', 'dataInicio', 'dataFim']
        });
        
        res.json({
            success: true,
            data: {
                available: conflictingReservations.length === 0,
                conflicts: conflictingReservations
            }
        });
    })
};
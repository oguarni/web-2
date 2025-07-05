const db = require('../../config/db_sequelize');

module.exports = {
    // GET /api/espacos
    async index(req, res) {
        try {
            const { ativo } = req.query;
            let where = {};
            
            if (ativo !== undefined) {
                where.ativo = ativo === 'true';
            }
            
            const espacos = await db.Espaco.findAll({
                where,
                include: [db.Amenity], // Include associated amenities
                order: [['nome', 'ASC']]
            });
            
            res.json({
                success: true,
                data: espacos
            });
        } catch (error) {
            console.error('Error fetching spaces:', error);
            res.status(500).json({
                error: 'Failed to fetch spaces'
            });
        }
    },
    
    // GET /api/espacos/:id
    async show(req, res) {
        try {
            const { id } = req.params;
            
            const espaco = await db.Espaco.findByPk(id, {
                include: [
                    {
                        model: db.Reserva,
                        attributes: ['id', 'titulo', 'dataInicio', 'dataFim', 'status'],
                        include: [
                            { model: db.Usuario, attributes: ['id', 'nome'] }
                        ]
                    },
                    { 
                        model: db.Amenity, // Include associated amenities
                        through: { attributes: [] } // Don't show join table attributes
                    } 
                ]
            });
            
            if (!espaco) {
                return res.status(404).json({
                    error: 'Space not found'
                });
            }
            
            res.json({
                success: true,
                data: espaco
            });
        } catch (error) {
            console.error('Error fetching space:', error);
            res.status(500).json({
                error: 'Failed to fetch space'
            });
        }
    },
    
    // POST /api/espacos
    async create(req, res) {
        try {
            const { nome, descricao, capacidade, localizacao, equipamentos } = req.body;
            
            if (!nome || !capacidade || !localizacao) {
                return res.status(400).json({
                    error: 'Name, capacity and location are required'
                });
            }
            
            if (capacidade <= 0) {
                return res.status(400).json({
                    error: 'Capacity must be greater than zero'
                });
            }
            
            const existingSpace = await db.Espaco.findOne({ where: { nome } });
            if (existingSpace) {
                return res.status(409).json({
                    error: 'Space name already exists'
                });
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
        } catch (error) {
            console.error('Error creating space:', error);
            res.status(500).json({
                error: 'Failed to create space'
            });
        }
    },
    
    // PUT /api/espacos/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao, capacidade, localizacao, equipamentos, ativo } = req.body;
            
            const espaco = await db.Espaco.findByPk(id);
            if (!espaco) {
                return res.status(404).json({
                    error: 'Space not found'
                });
            }
            
            if (nome && nome !== espaco.nome) {
                const existingSpace = await db.Espaco.findOne({ 
                    where: { nome, id: { [db.Sequelize.Op.ne]: id } } 
                });
                if (existingSpace) {
                    return res.status(409).json({
                        error: 'Space name already exists'
                    });
                }
            }
            
            if (capacidade !== undefined && capacidade <= 0) {
                return res.status(400).json({
                    error: 'Capacity must be greater than zero'
                });
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
        } catch (error) {
            console.error('Error updating space:', error);
            res.status(500).json({
                error: 'Failed to update space'
            });
        }
    },
    
    // DELETE /api/espacos/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const espaco = await db.Espaco.findByPk(id);
            if (!espaco) {
                return res.status(404).json({
                    error: 'Space not found'
                });
            }
            
            const activeReservations = await db.Reserva.count({
                where: {
                    espacoId: id,
                    status: ['confirmada', 'pendente'],
                    dataFim: { [db.Sequelize.Op.gte]: new Date() }
                }
            });
            
            if (activeReservations > 0) {
                return res.status(409).json({
                    error: 'Cannot delete space with active reservations'
                });
            }
            
            await espaco.destroy();
            
            
            res.json({
                success: true,
                message: 'Space deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting space:', error);
            res.status(500).json({
                error: 'Failed to delete space'
            });
        }
    },
    
    // GET /api/espacos/:id/disponibilidade
    async checkAvailability(req, res) {
        try {
            const { id } = req.params;
            const { dataInicio, dataFim } = req.query;
            
            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    error: 'Start date and end date are required'
                });
            }
            
            const espaco = await db.Espaco.findByPk(id);
            if (!espaco || !espaco.ativo) {
                return res.status(404).json({
                    error: 'Space not found or inactive'
                });
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
        } catch (error) {
            console.error('Error checking availability:', error);
            res.status(500).json({
                error: 'Failed to check availability'
            });
        }
    }
};
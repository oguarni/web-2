const db = require('../../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    // GET /api/reservas
    async index(req, res) {
        try {
            let where = {};
            
            // Non-admin users can only see their own reservations
            if (req.user.type !== 1) {
                where.usuarioId = req.user.id;
            }
            
            const reservas = await db.Reserva.findAll({
                where,
                include: [
                    { model: db.Usuario, attributes: ['id', 'nome', 'login'] },
                    { model: db.Espaco, attributes: ['id', 'nome', 'localizacao'] }
                ],
                order: [['dataInicio', 'DESC']]
            });
            
            res.json({
                success: true,
                data: reservas
            });
        } catch (error) {
            console.error('Error fetching reservations:', error);
            res.status(500).json({
                error: 'Failed to fetch reservations'
            });
        }
    },
    
    // GET /api/reservas/:id
    async show(req, res) {
        try {
            const { id } = req.params;
            let where = { id };
            
            // Non-admin users can only see their own reservations
            if (req.user.type !== 1) {
                where.usuarioId = req.user.id;
            }
            
            const reserva = await db.Reserva.findOne({
                where,
                include: [
                    { model: db.Usuario, attributes: ['id', 'nome', 'login'] },
                    { model: db.Espaco, attributes: ['id', 'nome', 'localizacao', 'capacidade'] }
                ]
            });
            
            if (!reserva) {
                return res.status(404).json({
                    error: 'Reservation not found'
                });
            }
            
            res.json({
                success: true,
                data: reserva
            });
        } catch (error) {
            console.error('Error fetching reservation:', error);
            res.status(500).json({
                error: 'Failed to fetch reservation'
            });
        }
    },
    
    // POST /api/reservas
    async create(req, res) {
        try {
            const { titulo, dataInicio, dataFim, descricao, espacoId } = req.body;
            
            if (!titulo || !dataInicio || !dataFim || !espacoId) {
                return res.status(400).json({
                    error: 'Title, start date, end date and space are required'
                });
            }
            
            // Validate dates
            const startDate = new Date(dataInicio);
            const endDate = new Date(dataFim);
            
            if (startDate >= endDate) {
                return res.status(400).json({
                    error: 'End date must be after start date'
                });
            }
            
            if (startDate < new Date()) {
                return res.status(400).json({
                    error: 'Start date cannot be in the past'
                });
            }
            
            // Check if space exists
            const espaco = await db.Espaco.findByPk(espacoId);
            if (!espaco || !espaco.ativo) {
                return res.status(404).json({
                    error: 'Space not found or inactive'
                });
            }
            
            // Check for conflicting reservations
            const conflictingReservations = await db.Reserva.findAll({
                where: {
                    espacoId,
                    status: 'confirmada',
                    [Op.or]: [
                        {
                            dataInicio: {
                                [Op.between]: [dataInicio, dataFim]
                            }
                        },
                        {
                            dataFim: {
                                [Op.between]: [dataInicio, dataFim]
                            }
                        },
                        {
                            [Op.and]: [
                                { dataInicio: { [Op.lte]: dataInicio } },
                                { dataFim: { [Op.gte]: dataFim } }
                            ]
                        }
                    ]
                }
            });
            
            if (conflictingReservations.length > 0) {
                return res.status(409).json({
                    error: 'Space is already reserved for this time period'
                });
            }
            
            const reserva = await db.Reserva.create({
                titulo,
                dataInicio,
                dataFim,
                descricao,
                espacoId,
                usuarioId: req.user.id,
                status: 'pendente'
            });
            
            // Log reservation creation
            
            res.status(201).json({
                success: true,
                data: reserva
            });
        } catch (error) {
            console.error('Error creating reservation:', error);
            res.status(500).json({
                error: 'Failed to create reservation'
            });
        }
    },
    
    // PUT /api/reservas/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { titulo, dataInicio, dataFim, descricao, status } = req.body;
            
            let where = { id };
            
            // Non-admin users can only update their own reservations
            if (req.user.type !== 1) {
                where.usuarioId = req.user.id;
            }
            
            const reserva = await db.Reserva.findOne({ where });
            if (!reserva) {
                return res.status(404).json({
                    error: 'Reservation not found'
                });
            }
            
            // Validate status change permissions
            if (status && req.user.type !== 1) {
                return res.status(403).json({
                    error: 'Only administrators can change reservation status'
                });
            }
            
            // Validate dates if provided
            if (dataInicio || dataFim) {
                const startDate = new Date(dataInicio || reserva.dataInicio);
                const endDate = new Date(dataFim || reserva.dataFim);
                
                if (startDate >= endDate) {
                    return res.status(400).json({
                        error: 'End date must be after start date'
                    });
                }
            }
            
            await reserva.update({
                titulo: titulo || reserva.titulo,
                dataInicio: dataInicio || reserva.dataInicio,
                dataFim: dataFim || reserva.dataFim,
                descricao: descricao || reserva.descricao,
                status: status || reserva.status
            });
            
            // Log reservation update
            
            res.json({
                success: true,
                data: reserva
            });
        } catch (error) {
            console.error('Error updating reservation:', error);
            res.status(500).json({
                error: 'Failed to update reservation'
            });
        }
    },
    
    // DELETE /api/reservas/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            let where = { id };
            
            // Non-admin users can only delete their own reservations
            if (req.user.type !== 1) {
                where.usuarioId = req.user.id;
            }
            
            const reserva = await db.Reserva.findOne({ where });
            if (!reserva) {
                return res.status(404).json({
                    error: 'Reservation not found'
                });
            }
            
            await reserva.destroy();
            
            // Log reservation deletion
            
            res.json({
                success: true,
                message: 'Reservation deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting reservation:', error);
            res.status(500).json({
                error: 'Failed to delete reservation'
            });
        }
    },
    
    // PUT /api/reservas/:id/status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['confirmada', 'pendente', 'cancelada'].includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status. Must be: confirmada, pendente, or cancelada'
                });
            }
            
            const reserva = await db.Reserva.findByPk(id);
            if (!reserva) {
                return res.status(404).json({
                    error: 'Reservation not found'
                });
            }
            
            await reserva.update({ status });
            
            // Log status change
            
            res.json({
                success: true,
                data: reserva
            });
        } catch (error) {
            console.error('Error updating reservation status:', error);
            res.status(500).json({
                error: 'Failed to update reservation status'
            });
        }
    }
};
const db = require('../../config/db_sequelize');
const { Op } = require('sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError, ForbiddenError } = require('../../middlewares/errorHandler');
const { getUserBasedWhereClause, ensureCanAccessResource, isAdmin } = require('../../middlewares/authHelpers');

module.exports = {
    // GET /api/reservas
    index: asyncHandler(async (req, res) => {
        const where = getUserBasedWhereClause(req);
        
        const reservas = await db.Reserva.findAll({
            where,
            include: [
                { model: db.Usuario, as: 'usuario', attributes: ['id', 'nome', 'login'] },
                { model: db.Espaco, as: 'espaco', attributes: ['id', 'nome', 'localizacao'] }
            ],
            order: [['dataInicio', 'DESC']]
        });
        
        res.json({
            success: true,
            data: reservas
        });
    }),
    
    // GET /api/reservas/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const reserva = await db.Reserva.findByPk(id, {
            include: [
                { model: db.Usuario, as: 'usuario', attributes: ['id', 'nome', 'login'] },
                { model: db.Espaco, as: 'espaco', attributes: ['id', 'nome', 'localizacao', 'capacidade'] }
            ]
        });
        
        if (!reserva) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Ensure user can access this reservation
        ensureCanAccessResource(reserva, req, 'usuarioId', 'reservation');
        
        res.json({
            success: true,
            data: reserva
        });
    }),
    
    // POST /api/reservas
    create: asyncHandler(async (req, res) => {
        const { titulo, dataInicio, dataFim, descricao, espacoId } = req.body;
        
        // Check if space exists and is active
        const espaco = await db.Espaco.findByPk(espacoId);
        if (!espaco || !espaco.ativo) {
            throw new NotFoundError('Space not found or inactive');
        }
        
        // Check for conflicting reservations (both confirmed and pending)
        const conflictingReservations = await db.Reserva.findAll({
            where: {
                espacoId,
                status: { [Op.in]: ['confirmada', 'pendente'] },
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
            throw new ConflictError('Space is already reserved for this time period');
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
    }),
    
    // PUT /api/reservas/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { titulo, dataInicio, dataFim, descricao, status } = req.body;
        
        const reserva = await db.Reserva.findByPk(id);
        if (!reserva) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Only administrators can change reservation status
        if (status && !isAdmin(req)) {
            throw new ForbiddenError('Only administrators can change reservation status');
        }
        
        // Security: Ensure user can access this reservation
        ensureCanAccessResource(reserva, req, 'usuarioId', 'reservation');
        
        await reserva.update({
            titulo: titulo || reserva.titulo,
            dataInicio: dataInicio || reserva.dataInicio,
            dataFim: dataFim || reserva.dataFim,
            descricao: descricao || reserva.descricao,
            status: status || reserva.status
        });
        
        res.json({
            success: true,
            data: reserva
        });
    }),
    
    // DELETE /api/reservas/:id
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const reserva = await db.Reserva.findByPk(id);
        if (!reserva) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Ensure user can access this reservation
        ensureCanAccessResource(reserva, req, 'usuarioId', 'reservation');
        
        await reserva.destroy();
        
        res.json({
            success: true,
            message: 'Reservation deleted successfully'
        });
    }),
    
    // PUT /api/reservas/:id/status
    updateStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        
        const reserva = await db.Reserva.findByPk(id);
        if (!reserva) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Only administrators can change reservation status
        if (!isAdmin(req)) {
            throw new ForbiddenError('Only administrators can change reservation status');
        }
        
        await reserva.update({ status });
        
        res.json({
            success: true,
            data: reserva
        });
    })
};
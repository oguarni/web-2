const db = require('../../config/db_sequelize');
const { Op } = require('sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError, ForbiddenError } = require('../../middlewares/errorHandler');
const { getUserBasedWhereClause, ensureCanAccessResource, isAdmin } = require('../../middlewares/authHelpers');
const Log = require('../../models/noSql/log');

module.exports = {
    // GET /api/reservas
    index: asyncHandler(async (req, res) => {
        const where = getUserBasedWhereClause(req);
        
        const reservations = await db.Reservation.findAll({
            where,
            include: [
                { model: db.User, as: 'user', attributes: ['id', 'name', 'login'] },
                { model: db.Space, as: 'space', attributes: ['id', 'name', 'location'] }
            ],
            order: [['startDate', 'DESC']]
        });
        
        res.json({
            success: true,
            data: reservations
        });
    }),
    
    // GET /api/reservas/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const reservation = await db.Reservation.findByPk(id, {
            include: [
                { model: db.User, as: 'user', attributes: ['id', 'name', 'login'] },
                { model: db.Space, as: 'space', attributes: ['id', 'name', 'location', 'capacity'] }
            ]
        });
        
        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Ensure user can access this reservation
        ensureCanAccessResource(reservation, req, 'userId', 'reservation');
        
        res.json({
            success: true,
            data: reservation
        });
    }),
    
    // POST /api/reservas
    create: asyncHandler(async (req, res) => {
        const { title, startDate, endDate, description, spaceId } = req.body;
        
        // Check if space exists and is active
        const space = await db.Space.findByPk(spaceId);
        if (!space || !space.active) {
            throw new NotFoundError('Space not found or inactive');
        }
        
        // Check for conflicting reservations (both confirmed and pending)
        const conflictingReservations = await db.Reservation.findAll({
            where: {
                spaceId,
                status: { [Op.in]: ['confirmed', 'pending'] },
                [Op.or]: [
                    {
                        startDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        [Op.and]: [
                            { startDate: { [Op.lte]: startDate } },
                            { endDate: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            }
        });
        
        if (conflictingReservations.length > 0) {
            throw new ConflictError('Space is already reserved for this time period');
        }
        
        const reservation = await db.Reservation.create({
            title,
            startDate,
            endDate,
            description,
            spaceId,
            userId: req.user.id,
            status: 'pending'
        });
            
        // Log reservation creation
        const log = new Log({
            usuarioId: req.user.id,
            acao: 'CREATE_RESERVATION',
            ip: req.ip,
            detalhes: { reservationId: reservation.id }
        });
        await log.save();
            
        res.status(201).json({
            success: true,
            data: reservation
        });
    }),
    
    // PUT /api/reservas/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, startDate, endDate, description, status } = req.body;
        
        const reservation = await db.Reservation.findByPk(id);
        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Only administrators can change reservation status
        if (status && !isAdmin(req)) {
            throw new ForbiddenError('Only administrators can change reservation status');
        }
        
        // Security: Ensure user can access this reservation
        ensureCanAccessResource(reservation, req, 'userId', 'reservation');
        
        await reservation.update({
            title: title || reservation.title,
            startDate: startDate || reservation.startDate,
            endDate: endDate || reservation.endDate,
            description: description || reservation.description,
            status: status || reservation.status
        });
        
        res.json({
            success: true,
            data: reservation
        });
    }),
    
    // DELETE /api/reservas/:id
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const reservation = await db.Reservation.findByPk(id);
        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Ensure user can access this reservation
        ensureCanAccessResource(reservation, req, 'userId', 'reservation');
        
        await reservation.destroy();
        
        res.json({
            success: true,
            message: 'Reservation deleted successfully'
        });
    }),
    
    // PUT /api/reservas/:id/status
    updateStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        
        const reservation = await db.Reservation.findByPk(id);
        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }
        
        // Security: Only administrators can change reservation status
        if (!isAdmin(req)) {
            throw new ForbiddenError('Only administrators can change reservation status');
        }
        
        await reservation.update({ status });
        
        res.json({
            success: true,
            data: reservation
        });
    })
};
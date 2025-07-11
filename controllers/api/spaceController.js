const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError, ConflictError, ValidationError } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /api/espacos
    index: asyncHandler(async (req, res) => {
        const { active } = req.query;
        let where = {};
        
        if (active !== undefined) {
            where.active = active === 'true';
        }
        
        const spaces = await db.Space.findAll({
            where,
            include: [{ model: db.Amenity, as: 'amenities' }],
            order: [['name', 'ASC']]
        });
        
        res.json({
            success: true,
            data: spaces
        });
    }),
    
    // GET /api/espacos/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const space = await db.Space.findByPk(id, {
            include: [
                {
                    model: db.Reservation,
                    as: 'reservations',
                    attributes: ['id', 'title', 'startDate', 'endDate', 'status'],
                    include: [
                        { model: db.User, as: 'user', attributes: ['id', 'name'] }
                    ]
                },
                { 
                    model: db.Amenity,
                    as: 'amenities',
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!space) {
            throw new NotFoundError('Space not found');
        }
        
        res.json({
            success: true,
            data: space
        });
    }),
    
    // POST /api/espacos
    create: asyncHandler(async (req, res) => {
        const { name, description, capacity, location, equipment } = req.body;
        
        if (!name || !capacity || !location) {
            throw new ValidationError('Name, capacity and location are required');
        }
        
        if (capacity <= 0) {
            throw new ValidationError('Capacity must be greater than zero');
        }
        
        const existingSpace = await db.Space.findOne({ where: { name } });
        if (existingSpace) {
            throw new ConflictError('Space name already exists');
        }
        
        const space = await db.Space.create({
            name,
            description,
            capacity,
            location,
            equipment,
            active: true
        });
        
        res.status(201).json({
            success: true,
            data: space
        });
    }),
    
    // PUT /api/espacos/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, capacity, location, equipment, active } = req.body;
        
        const space = await db.Space.findByPk(id);
        if (!space) {
            throw new NotFoundError('Space not found');
        }
        
        if (name && name !== space.name) {
            const existingSpace = await db.Space.findOne({ 
                where: { name, id: { [db.Sequelize.Op.ne]: id } } 
            });
            if (existingSpace) {
                throw new ConflictError('Space name already exists');
            }
        }
        
        if (capacity !== undefined && capacity <= 0) {
            throw new ValidationError('Capacity must be greater than zero');
        }
        
        await space.update({
            name: name || space.name,
            description: description !== undefined ? description : space.description,
            capacity: capacity || space.capacity,
            location: location || space.location,
            equipment: equipment !== undefined ? equipment : space.equipment,
            active: active !== undefined ? active : space.active
        });
        
        res.json({
            success: true,
            data: space
        });
    }),
    
    // DELETE /api/espacos/:id
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const space = await db.Space.findByPk(id);
        if (!space) {
            throw new NotFoundError('Space not found');
        }
        
        const activeReservations = await db.Reservation.count({
            where: {
                spaceId: id,
                status: ['confirmed', 'pending'],
                endDate: { [db.Sequelize.Op.gte]: new Date() }
            }
        });
        
        if (activeReservations > 0) {
            throw new ConflictError('Cannot delete space with active reservations');
        }
        
        await space.destroy();
        
        res.json({
            success: true,
            message: 'Space deleted successfully'
        });
    }),
    
    // GET /api/espacos/:id/disponibilidade
    checkAvailability: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            throw new ValidationError('Start date and end date are required');
        }
        
        const space = await db.Space.findByPk(id);
        if (!space || !space.active) {
            throw new NotFoundError('Space not found or inactive');
        }
        
        const conflictingReservations = await db.Reservation.findAll({
            where: {
                spaceId: id,
                status: 'confirmed',
                [db.Sequelize.Op.or]: [
                    {
                        startDate: {
                            [db.Sequelize.Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        endDate: {
                            [db.Sequelize.Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        [db.Sequelize.Op.and]: [
                            { startDate: { [db.Sequelize.Op.lte]: startDate } },
                            { endDate: { [db.Sequelize.Op.gte]: endDate } }
                        ]
                    }
                ]
            },
            attributes: ['id', 'title', 'startDate', 'endDate']
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
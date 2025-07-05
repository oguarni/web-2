const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /api/amenities
    index: asyncHandler(async (req, res) => {
        const amenities = await db.Amenity.findAll();
        res.json({ success: true, data: amenities });
    }),

    // GET /api/amenities/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const amenity = await db.Amenity.findByPk(id);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }
        res.json({ success: true, data: amenity });
    }),

    // POST /api/amenities
    store: asyncHandler(async (req, res) => {
        const { nome, descricao } = req.body;
        const newAmenity = await db.Amenity.create({ nome, descricao });
        res.status(201).json({ success: true, data: newAmenity });
    }),

    // PUT /api/amenities/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nome, descricao } = req.body;
        const amenity = await db.Amenity.findByPk(id);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }
        await amenity.update({ nome, descricao });
        res.json({ success: true, data: amenity });
    }),

    // DELETE /api/amenities/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const amenity = await db.Amenity.findByPk(id);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }
        await amenity.destroy();
        res.json({ success: true, message: 'Amenity deleted successfully' });
    })
};
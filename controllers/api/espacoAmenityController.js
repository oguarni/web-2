const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError } = require('../../middlewares/errorHandler');

module.exports = {
    // POST /api/espacos/:espacoId/amenities
    addAmenityToSpace: asyncHandler(async (req, res) => {
        const { espacoId } = req.params;
        const { amenityId } = req.body;

        const espaco = await db.Espaco.findByPk(espacoId);
        if (!espaco) {
            throw new NotFoundError('Space not found');
        }

        const amenity = await db.Amenity.findByPk(amenityId);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }

        await espaco.addAmenity(amenity);

        res.status(201).json({ 
            success: true, 
            message: 'Amenity added to space successfully' 
        });
    }),

    // DELETE /api/espacos/:espacoId/amenities/:amenityId
    removeAmenityFromSpace: asyncHandler(async (req, res) => {
        const { espacoId, amenityId } = req.params;

        const espaco = await db.Espaco.findByPk(espacoId);
        if (!espaco) {
            throw new NotFoundError('Space not found');
        }

        const amenity = await db.Amenity.findByPk(amenityId);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }

        await espaco.removeAmenity(amenity);

        res.json({ 
            success: true, 
            message: 'Amenity removed from space successfully' 
        });
    })
};
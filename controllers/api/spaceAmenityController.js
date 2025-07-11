const { Space, Amenity } = require('../../models/relational');
const Log = require('../../models/noSql/log');
const { asyncHandler, NotFoundError } = require('../../middlewares/errorHandler');

// Associate an amenity to a space
exports.associateAmenity = asyncHandler(async (req, res) => {
    const { spaceId } = req.params;
    const { amenityId } = req.body;

    const space = await Space.findByPk(spaceId);
    if (!space) {
        throw new NotFoundError('Space not found');
    }

    const amenity = await Amenity.findByPk(amenityId);
    if (!amenity) {
        throw new NotFoundError('Amenity not found');
    }

    await space.addAmenity(amenity);

    // Log the action
    const log = new Log({
        level: 'info',
        message: `Amenity ${amenityId} associated with space ${spaceId} by user ${req.user.id}`,
        resource: 'SpaceAmenity',
        userId: req.user.id,
    });
    await log.save();

    res.status(200).json({ message: 'Amenity associated successfully' });
});

// Disassociate an amenity from a space
exports.disassociateAmenity = asyncHandler(async (req, res) => {
    const { spaceId, amenityId } = req.params;

    const space = await Space.findByPk(spaceId);
    if (!space) {
        throw new NotFoundError('Space not found');
    }

    const amenity = await Amenity.findByPk(amenityId);
    if (!amenity) {
        throw new NotFoundError('Amenity not found');
    }

    await space.removeAmenity(amenity);

    // Log the action
    const log = new Log({
        level: 'info',
        message: `Amenity ${amenityId} disassociated from space ${spaceId} by user ${req.user.id}`,
        resource: 'SpaceAmenity',
        userId: req.user.id,
    });
    await log.save();
    
    res.status(200).json({ message: 'Amenity disassociated successfully' });
});

// List all amenities of a specific space
exports.getAmenitiesForSpace = asyncHandler(async (req, res) => {
    const { spaceId } = req.params;

    const space = await Space.findByPk(spaceId, {
        include: [{
            model: Amenity,
            as: 'amenities',
            through: { attributes: [] } // Don't include junction table attributes
        }]
    });

    if (!space) {
        throw new NotFoundError('Space not found');
    }

    res.status(200).json(space.amenities);
});

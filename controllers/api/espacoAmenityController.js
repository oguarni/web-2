const { SpaceAmenity, Space, Amenity } = require('../../config/db_sequelize');
const Log = require('../../models/noSql/log');

// Associate an amenity to a space
exports.associateAmenity = async (req, res) => {
    const { spaceId, amenityId } = req.body;
    try {
        const space = await Space.findByPk(spaceId);
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }
        const amenity = await Amenity.findByPk(amenityId);
        if (!amenity) {
            return res.status(404).json({ message: 'Amenity not found' });
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
    } catch (error) {
        console.error("Error associating amenity:", error);
        const log = new Log({
            level: 'error',
            message: `Error associating amenity ${amenityId} with space ${spaceId}: ${error.message}`,
            resource: 'SpaceAmenity',
            userId: req.user.id,
        });
        await log.save();
        res.status(500).json({ message: 'Server error' });
    }
};

// Disassociate an amenity from a space
exports.disassociateAmenity = async (req, res) => {
    const { spaceId, amenityId } = req.params;
    try {
        const space = await Space.findByPk(spaceId);
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }
        const amenity = await Amenity.findByPk(amenityId);
        if (!amenity) {
            return res.status(404).json({ message: 'Amenity not found' });
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
    } catch (error) {
        console.error("Error disassociating amenity:", error);
        const log = new Log({
            level: 'error',
            message: `Error disassociating amenity ${amenityId} from space ${spaceId}: ${error.message}`,
            resource: 'SpaceAmenity',
            userId: req.user.id,
        });
        await log.save();
        res.status(500).json({ message: 'Server error' });
    }
};

// List all amenities of a specific space
exports.getAmenitiesForSpace = async (req, res) => {
    const { spaceId } = req.params;
    try {
        const space = await Space.findByPk(spaceId, {
            include: [{
                model: Amenity,
                as: 'amenities',
                through: { attributes: [] } // Don't include junction table attributes
            }]
        });
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }
        res.status(200).json(space.amenities);
    } catch (error) {
        console.error("Error fetching space amenities:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
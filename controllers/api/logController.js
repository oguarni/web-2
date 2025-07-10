const mongoose = require('mongoose');
const { StringCon, connectDB } = require('../../config/db_mongoose');
const Log = require('../../models/noSql/log');
const { asyncHandler, NotFoundError, ValidationError } = require('../../middlewares/errorHandler');

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
    connectDB().then(() => {
        console.log('MongoDB connected for logs');
    }).catch((err) => {
        console.error('MongoDB connection error:', err);
    });
}

module.exports = {
    // GET /api/logs
    index: asyncHandler(async (req, res) => {
        const { page = 1, limit = 50, usuarioId, acao, startDate, endDate } = req.query;
        
        // Build filter object
        let filter = {};
        
        if (usuarioId) {
            filter.usuarioId = parseInt(usuarioId);
        }
        
        if (acao) {
            filter.acao = { $regex: acao, $options: 'i' };
        }
        
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.timestamp.$lte = new Date(endDate);
            }
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get logs with pagination
        const logs = await Log.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const total = await Log.countDocuments(filter);
        
        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }),
    
    // GET /api/logs/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError('Invalid log ID format');
        }
        
        const log = await Log.findById(id);
        
        if (!log) {
            throw new NotFoundError('Log not found');
        }
        
        res.json({
            success: true,
            data: log
        });
    }),
    
    // POST /api/logs
    create: asyncHandler(async (req, res) => {
        const { usuarioId, userId, acao, action, level, message, ip, detalhes } = req.body;
        
        // Support both Portuguese and English field names
        const logUserId = usuarioId || userId;
        const logAction = acao || action || level || message;
        
        if (!logUserId || !logAction) {
            throw new ValidationError('User ID and action are required');
        }
        
        const log = new Log({
            usuarioId: logUserId,
            acao: logAction,
            ip: ip || req.ip,
            detalhes: detalhes || { level, message }
        });
        
        await log.save();
        
        res.status(201).json({
            success: true,
            data: log
        });
    }),
    
    // GET /api/logs/stats
    getStats: asyncHandler(async (req, res) => {
        const { startDate, endDate } = req.query;
        
        // Build match filter for aggregation
        let matchFilter = {};
        if (startDate || endDate) {
            matchFilter.timestamp = {};
            if (startDate) {
                matchFilter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                matchFilter.timestamp.$lte = new Date(endDate);
            }
        }
        
        // Aggregate statistics
        const stats = await Log.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalLogs: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$usuarioId' },
                    actions: { $addToSet: '$acao' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalLogs: 1,
                    uniqueUsersCount: { $size: '$uniqueUsers' },
                    uniqueActionsCount: { $size: '$actions' },
                    actions: 1
                }
            }
        ]);
        
        // Get action frequency
        const actionStats = await Log.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$acao',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        // Get user activity
        const userStats = await Log.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$usuarioId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        res.json({
            success: true,
            data: {
                overview: stats[0] || { totalLogs: 0, uniqueUsersCount: 0, uniqueActionsCount: 0 },
                topActions: actionStats,
                topUsers: userStats
            }
        });
    }),
    
    // DELETE /api/logs/cleanup
    cleanup: asyncHandler(async (req, res) => {
        const { olderThan } = req.body;
        
        if (!olderThan) {
            throw new ValidationError('olderThan date is required');
        }
        
        const cutoffDate = new Date(olderThan);
        
        if (isNaN(cutoffDate.getTime())) {
            throw new ValidationError('Invalid date format');
        }
        
        const result = await Log.deleteMany({
            timestamp: { $lt: cutoffDate }
        });
        
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} log entries older than ${cutoffDate.toISOString()}`
        });
    })
};
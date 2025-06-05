const mongoose = require('mongoose');
const db_mongoose = require('../../config/db_mongoose');
const Log = require('../../models/noSql/log');

// Connect to MongoDB
mongoose.connect(db_mongoose.connection).then(() => {
    console.log('Connected to MongoDB for logs');
}).catch((err) => {
    console.log('MongoDB connection error:', err);
});

module.exports = {
    // GET /api/logs
    async index(req, res) {
        try {
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
        } catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).json({
                error: 'Failed to fetch logs'
            });
        }
    },
    
    // GET /api/logs/:id
    async show(req, res) {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: 'Invalid log ID format'
                });
            }
            
            const log = await Log.findById(id);
            
            if (!log) {
                return res.status(404).json({
                    error: 'Log not found'
                });
            }
            
            res.json({
                success: true,
                data: log
            });
        } catch (error) {
            console.error('Error fetching log:', error);
            res.status(500).json({
                error: 'Failed to fetch log'
            });
        }
    },
    
    // POST /api/logs
    async create(req, res) {
        try {
            const { usuarioId, acao, ip, detalhes } = req.body;
            
            if (!usuarioId || !acao) {
                return res.status(400).json({
                    error: 'User ID and action are required'
                });
            }
            
            const log = new Log({
                usuarioId,
                acao,
                ip: ip || req.ip,
                detalhes
            });
            
            await log.save();
            
            res.status(201).json({
                success: true,
                data: log
            });
        } catch (error) {
            console.error('Error creating log:', error);
            res.status(500).json({
                error: 'Failed to create log'
            });
        }
    },
    
    // GET /api/logs/stats
    async getStats(req, res) {
        try {
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
        } catch (error) {
            console.error('Error fetching log stats:', error);
            res.status(500).json({
                error: 'Failed to fetch log statistics'
            });
        }
    },
    
    // DELETE /api/logs/cleanup
    async cleanup(req, res) {
        try {
            const { olderThan } = req.body;
            
            if (!olderThan) {
                return res.status(400).json({
                    error: 'olderThan date is required'
                });
            }
            
            const cutoffDate = new Date(olderThan);
            
            if (isNaN(cutoffDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid date format'
                });
            }
            
            const result = await Log.deleteMany({
                timestamp: { $lt: cutoffDate }
            });
            
            res.json({
                success: true,
                message: `Deleted ${result.deletedCount} log entries older than ${cutoffDate.toISOString()}`
            });
        } catch (error) {
            console.error('Error cleaning up logs:', error);
            res.status(500).json({
                error: 'Failed to cleanup logs'
            });
        }
    }
};
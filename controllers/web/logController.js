const Log = require('../../models/noSql/log');
const db = require('../../config/db_sequelize');
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /logs
    index: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const [logs, total] = await Promise.all([
            Log.find()
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Log.countDocuments()
        ]);

        // Get user names for logs
        const userIds = [...new Set(logs.map(log => log.usuarioId))];
        const users = await db.Usuario.findAll({
            where: { id: userIds },
            attributes: ['id', 'nome']
        });

        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.nome;
            return acc;
        }, {});

        const logsWithUsers = logs.map(log => ({
            ...log,
            usuarioNome: userMap[log.usuarioId] || 'Usuário não encontrado'
        }));

        const totalPages = Math.ceil(total / limit);
        
        res.render('logs/index', {
            title: 'Logs do Sistema',
            logs: logsWithUsers,
            pagination: {
                page,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                nextPage: page + 1,
                prevPage: page - 1
            }
        });
    }),

    // GET /logs/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const log = await Log.findById(id).lean();
        
        if (!log) {
            req.flash('error', 'Log não encontrado');
            return res.redirect('/logs');
        }

        // Get user name
        const user = await db.Usuario.findByPk(log.usuarioId, {
            attributes: ['id', 'nome', 'login']
        });
        
        res.render('logs/show', {
            title: 'Detalhes do Log',
            log: {
                ...log,
                usuario: user || { nome: 'Usuário não encontrado' }
            }
        });
    }),

    // GET /logs/cleanup
    cleanup: asyncHandler(async (req, res) => {
        const stats = await Log.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    oldest: { $min: '$timestamp' },
                    newest: { $max: '$timestamp' }
                }
            }
        ]);

        const logStats = stats[0] || { total: 0, oldest: null, newest: null };

        res.render('logs/cleanup', {
            title: 'Limpeza de Logs',
            stats: logStats
        });
    }),

    // POST /logs/cleanup
    performCleanup: asyncHandler(async (req, res) => {
        const { cleanupType, days } = req.body;
        
        try {
            let deleteCount = 0;
            
            if (cleanupType === 'by_date' && days) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
                
                const result = await Log.deleteMany({
                    timestamp: { $lt: cutoffDate }
                });
                deleteCount = result.deletedCount;
            } else if (cleanupType === 'all') {
                const result = await Log.deleteMany({});
                deleteCount = result.deletedCount;
            }

            req.flash('success', `${deleteCount} logs foram removidos`);
            res.redirect('/logs');
        } catch (error) {
            req.flash('error', 'Erro ao realizar limpeza: ' + error.message);
            res.redirect('/logs/cleanup');
        }
    })
};
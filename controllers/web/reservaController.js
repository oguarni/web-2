// Database will be accessed via req.app.get('db') to avoid module loading issues
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /reservas
    index: asyncHandler(async (req, res) => {
        const database = req.app.get('db');
        const userType = req.session.user.type;
        const userId = req.session.user.id;
        
        let whereClause = {};
        
        // Common users can only see their own reservations
        if (userType === 2) {
            whereClause = { userId: userId };
        }
        // Admin (1) and Gestor (3) can see all reservations
        
        const reservas = await database.Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: database.User,
                    as: 'user', // <-- CORREÇÃO: Adicionado alias
                    attributes: ['id', 'name', 'login']
                },
                {
                    model: database.Space,
                    as: 'space', // <-- CORREÇÃO: Adicionado alias
                    attributes: ['id', 'name', 'location']
                }
            ],
            order: [['startDate', 'DESC']]
        });
        
        res.render('reservations/index', {
            title: 'Reservas',
            reservas,
            user: req.session.user,
            isAuthenticated: true,
            canCreateReserva: true,
            canManageAll: userType === 1 || userType === 3
        });
    }),

    // GET /reservas/new
    new: asyncHandler(async (req, res) => {
        const database = req.app.get('db');
        const espacos = await database.Space.findAll({
            where: { active: true },
            attributes: ['id', 'name', 'location', 'capacity']
        });
        
        res.render('reservations/new', {
            title: 'Nova Reserva',
            espacos,
            user: req.session.user,
            isAuthenticated: true
        });
    }),

    // POST /reservas
    create: asyncHandler(async (req, res) => {
        const { titulo, dataInicio, dataFim, descricao, espacoId } = req.body;
        const userId = req.session.user.id;
        
        if (!titulo || !dataInicio || !dataFim || !espacoId) {
            req.flash('error', 'Título, data início, data fim e espaço são obrigatórios');
            return res.redirect('/web/reservas/new');
        }

        try {
            const database = req.app.get('db');
            const startDate = new Date(dataInicio);
            const endDate = new Date(dataFim);
            
            // Check for conflicts
            const conflictingReserva = await database.Reservation.findOne({
                where: {
                    espacoId,
                    status: ['confirmada', 'pendente'],
                    [database.Sequelize.Op.or]: [
                        { dataInicio: { [database.Sequelize.Op.between]: [startDate, endDate] } },
                        { dataFim: { [database.Sequelize.Op.between]: [startDate, endDate] } },
                        { [database.Sequelize.Op.and]: [
                            { dataInicio: { [database.Sequelize.Op.lte]: startDate } },
                            { dataFim: { [database.Sequelize.Op.gte]: endDate } }
                        ]}
                    ]
                }
            });

            if (conflictingReserva) {
                req.flash('error', 'Existe uma reserva conflitante neste horário');
                return res.redirect('/web/reservas/new');
            }

            await database.Reservation.create({
                titulo,
                dataInicio: startDate,
                dataFim: endDate,
                descricao,
                userId,
                espacoId: parseInt(espacoId),
                status: 'pendente'
            });

            req.flash('success', 'Reserva criada com sucesso');
            res.redirect('/web/reservas');
        } catch (error) {
            req.flash('error', 'Erro ao criar reserva: ' + error.message);
            res.redirect('/reservas/new');
        }
    }),

    // GET /reservas/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userType = req.session.user.type;
        const userId = req.session.user.id;
        
        const database = req.app.get('db');
        const reserva = await database.Reservation.findByPk(id, {
            include: [
                {
                    model: database.User,
                    as: 'user', // <-- CORREÇÃO: Adicionado alias
                    attributes: ['id', 'nome', 'login']
                },
                {
                    model: database.Space,
                    as: 'space', // <-- CORREÇÃO: Adicionado alias
                    attributes: ['id', 'nome', 'localizacao', 'capacidade']
                }
            ]
        });
        
        if (!reserva) {
            req.flash('error', 'Reserva não encontrada');
            return res.redirect('/web/reservas');
        }

        if (userType === 2 && reserva.usuarioId !== userId) {
            req.flash('error', 'Você não tem permissão para ver esta reserva');
            return res.redirect('/web/reservas');
        }
        
        res.render('reservations/show', {
            title: 'Detalhes da Reserva',
            reserva,
            user: req.session.user,
            isAuthenticated: true,
            canManage: userType === 1 || userType === 3 || reserva.usuarioId === userId
        });
    }),

    // GET /reservas/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userType = req.session.user.type;
        const userId = req.session.user.id;
        
        const database = req.app.get('db');
        const reserva = await database.Reservation.findByPk(id);
        
        if (!reserva) {
            req.flash('error', 'Reserva não encontrada');
            return res.redirect('/web/reservas');
        }

        if (userType === 2 && reserva.usuarioId !== userId) {
            req.flash('error', 'Você não tem permissão para editar esta reserva');
            return res.redirect('/web/reservas');
        }

        const espacos = await database.Space.findAll({
            where: { ativo: true },
            attributes: ['id', 'nome', 'localizacao', 'capacidade']
        });
        
        res.render('reservations/edit', {
            title: 'Editar Reserva',
            reserva,
            espacos,
            user: req.session.user,
            isAuthenticated: true,
            canChangeStatus: userType === 1 || userType === 3
        });
    }),

    // PUT /reservas/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { titulo, dataInicio, dataFim, descricao, espacoId, status } = req.body;
        const userType = req.session.user.type;
        const userId = req.session.user.id;
        
        try {
            const database = req.app.get('db');
            const reserva = await database.Reservation.findByPk(id);
            if (!reserva) {
                req.flash('error', 'Reserva não encontrada');
                return res.redirect('/web/reservas');
            }

            if (userType === 2 && reserva.usuarioId !== userId) {
                req.flash('error', 'Você não tem permissão para editar esta reserva');
                return res.redirect('/web/reservas');
            }

            const startDate = new Date(dataInicio);
            const endDate = new Date(dataFim);
            
            const conflictingReserva = await database.Reservation.findOne({
                where: {
                    id: { [database.Sequelize.Op.ne]: id },
                    espacoId: parseInt(espacoId),
                    status: ['confirmada', 'pendente'],
                    [database.Sequelize.Op.or]: [
                        { dataInicio: { [database.Sequelize.Op.between]: [startDate, endDate] } },
                        { dataFim: { [database.Sequelize.Op.between]: [startDate, endDate] } },
                        { [database.Sequelize.Op.and]: [
                            { dataInicio: { [database.Sequelize.Op.lte]: startDate } },
                            { dataFim: { [database.Sequelize.Op.gte]: endDate } }
                        ]}
                    ]
                }
            });

            if (conflictingReserva) {
                req.flash('error', 'Existe uma reserva conflitante neste horário');
                return res.redirect(`/reservas/${id}/edit`);
            }

            const updateData = {
                titulo,
                dataInicio: startDate,
                dataFim: endDate,
                descricao,
                espacoId: parseInt(espacoId)
            };

            if ((userType === 1 || userType === 3) && status) {
                updateData.status = status;
            }

            await reserva.update(updateData);
            req.flash('success', 'Reserva atualizada com sucesso');
            res.redirect('/web/reservas');
        } catch (error) {
            req.flash('error', 'Erro ao atualizar reserva: ' + error.message);
            res.redirect(`/reservas/${id}/edit`);
        }
    }),

    // DELETE /reservas/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userType = req.session.user.type;
        const userId = req.session.user.id;
        
        try {
            const database = req.app.get('db');
            const reserva = await database.Reservation.findByPk(id);
            if (!reserva) {
                req.flash('error', 'Reserva não encontrada');
                return res.redirect('/web/reservas');
            }

            if (userType === 2 && reserva.usuarioId !== userId) {
                req.flash('error', 'Você não tem permissão para remover esta reserva');
                return res.redirect('/web/reservas');
            }

            await reserva.destroy();
            req.flash('success', 'Reserva removida com sucesso');
            res.redirect('/web/reservas');
        } catch (error) {
            req.flash('error', 'Erro ao remover reserva: ' + error.message);
            res.redirect('/web/reservas');
        }
    })
};

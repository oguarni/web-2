const db = require('../../config/db_sequelize');
const { asyncHandler } = require('../../middlewares/errorHandler');

module.exports = {
    // GET /reservas
    index: asyncHandler(async (req, res) => {
        const userType = req.session.user.tipo;
        const userId = req.session.user.id;
        
        let whereClause = {};
        
        // Common users can only see their own reservations
        if (userType === 2) {
            whereClause = { usuarioId: userId };
        }
        // Admin (1) and Gestor (3) can see all reservations
        
        const reservas = await db.Reserva.findAll({
            where: whereClause,
            include: [
                {
                    model: db.Usuario,
                    attributes: ['id', 'nome', 'login']
                },
                {
                    model: db.Espaco,
                    attributes: ['id', 'nome', 'localizacao']
                }
            ],
            order: [['dataInicio', 'DESC']]
        });
        
        res.render('reservations/index', {
            title: 'Reservas',
            reservas,
            canCreateReserva: true,
            canManageAll: userType === 1 || userType === 3
        });
    }),

    // GET /reservas/new
    new: asyncHandler(async (req, res) => {
        const espacos = await db.Espaco.findAll({
            where: { ativo: true },
            attributes: ['id', 'nome', 'localizacao', 'capacidade']
        });
        
        res.render('reservations/new', {
            title: 'Nova Reserva',
            espacos
        });
    }),

    // POST /reservas
    create: asyncHandler(async (req, res) => {
        const { titulo, dataInicio, dataFim, descricao, espacoId } = req.body;
        const usuarioId = req.session.user.id;
        
        if (!titulo || !dataInicio || !dataFim || !espacoId) {
            req.flash('error', 'Título, data início, data fim e espaço são obrigatórios');
            return res.redirect('/reservas/new');
        }

        try {
            const startDate = new Date(dataInicio);
            const endDate = new Date(dataFim);
            
            if (startDate >= endDate) {
                req.flash('error', 'Data de início deve ser anterior à data de fim');
                return res.redirect('/reservas/new');
            }

            if (startDate < new Date()) {
                req.flash('error', 'Data de início não pode ser no passado');
                return res.redirect('/reservas/new');
            }

            // Check for conflicts
            const conflictingReserva = await db.Reserva.findOne({
                where: {
                    espacoId,
                    status: ['confirmada', 'pendente'],
                    [db.Sequelize.Op.or]: [
                        {
                            dataInicio: {
                                [db.Sequelize.Op.between]: [startDate, endDate]
                            }
                        },
                        {
                            dataFim: {
                                [db.Sequelize.Op.between]: [startDate, endDate]
                            }
                        },
                        {
                            [db.Sequelize.Op.and]: [
                                { dataInicio: { [db.Sequelize.Op.lte]: startDate } },
                                { dataFim: { [db.Sequelize.Op.gte]: endDate } }
                            ]
                        }
                    ]
                }
            });

            if (conflictingReserva) {
                req.flash('error', 'Existe uma reserva conflitante neste horário');
                return res.redirect('/reservas/new');
            }

            await db.Reserva.create({
                titulo,
                dataInicio: startDate,
                dataFim: endDate,
                descricao,
                usuarioId,
                espacoId: parseInt(espacoId),
                status: 'pendente'
            });

            req.flash('success', 'Reserva criada com sucesso');
            res.redirect('/reservas');
        } catch (error) {
            req.flash('error', 'Erro ao criar reserva: ' + error.message);
            res.redirect('/reservas/new');
        }
    }),

    // GET /reservas/:id
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userType = req.session.user.tipo;
        const userId = req.session.user.id;
        
        const reserva = await db.Reserva.findByPk(id, {
            include: [
                {
                    model: db.Usuario,
                    attributes: ['id', 'nome', 'login']
                },
                {
                    model: db.Espaco,
                    attributes: ['id', 'nome', 'localizacao', 'capacidade']
                }
            ]
        });
        
        if (!reserva) {
            req.flash('error', 'Reserva não encontrada');
            return res.redirect('/reservas');
        }

        // Check permissions
        if (userType === 2 && reserva.usuarioId !== userId) {
            req.flash('error', 'Você não tem permissão para ver esta reserva');
            return res.redirect('/reservas');
        }
        
        res.render('reservations/show', {
            title: 'Detalhes da Reserva',
            reserva,
            canManage: userType === 1 || userType === 3 || reserva.usuarioId === userId
        });
    }),

    // GET /reservas/:id/edit
    edit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userType = req.session.user.tipo;
        const userId = req.session.user.id;
        
        const reserva = await db.Reserva.findByPk(id);
        
        if (!reserva) {
            req.flash('error', 'Reserva não encontrada');
            return res.redirect('/reservas');
        }

        // Check permissions
        if (userType === 2 && reserva.usuarioId !== userId) {
            req.flash('error', 'Você não tem permissão para editar esta reserva');
            return res.redirect('/reservas');
        }

        const espacos = await db.Espaco.findAll({
            where: { ativo: true },
            attributes: ['id', 'nome', 'localizacao', 'capacidade']
        });
        
        res.render('reservations/edit', {
            title: 'Editar Reserva',
            reserva,
            espacos,
            canChangeStatus: userType === 1 || userType === 3
        });
    }),

    // PUT /reservas/:id
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { titulo, dataInicio, dataFim, descricao, espacoId, status } = req.body;
        const userType = req.session.user.tipo;
        const userId = req.session.user.id;
        
        try {
            const reserva = await db.Reserva.findByPk(id);
            if (!reserva) {
                req.flash('error', 'Reserva não encontrada');
                return res.redirect('/reservas');
            }

            // Check permissions
            if (userType === 2 && reserva.usuarioId !== userId) {
                req.flash('error', 'Você não tem permissão para editar esta reserva');
                return res.redirect('/reservas');
            }

            const updateData = {
                titulo,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                descricao,
                espacoId: parseInt(espacoId)
            };

            // Only admin and gestor can change status
            if ((userType === 1 || userType === 3) && status) {
                updateData.status = status;
            }

            await reserva.update(updateData);
            req.flash('success', 'Reserva atualizada com sucesso');
            res.redirect('/reservas');
        } catch (error) {
            req.flash('error', 'Erro ao atualizar reserva: ' + error.message);
            res.redirect(`/reservas/${id}/edit`);
        }
    }),

    // DELETE /reservas/:id
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userType = req.session.user.tipo;
        const userId = req.session.user.id;
        
        try {
            const reserva = await db.Reserva.findByPk(id);
            if (!reserva) {
                req.flash('error', 'Reserva não encontrada');
                return res.redirect('/reservas');
            }

            // Check permissions
            if (userType === 2 && reserva.usuarioId !== userId) {
                req.flash('error', 'Você não tem permissão para remover esta reserva');
                return res.redirect('/reservas');
            }

            await reserva.destroy();
            req.flash('success', 'Reserva removida com sucesso');
            res.redirect('/reservas');
        } catch (error) {
            req.flash('error', 'Erro ao remover reserva: ' + error.message);
            res.redirect('/reservas');
        }
    })
};
const db = require('../config/db_sequelize');
const { Op } = require('sequelize');
const controllerLog = require('./controllerLog');

module.exports = {
    // Formulário de criação de reserva
    async getCreate(req, res) {
        try {
            const espacos = await db.Espaco.findAll({
                where: { ativo: true },
                order: [['nome', 'ASC']]
            });
            
            const recursos = await db.Recurso.findAll({
                order: [['nome', 'ASC']]
            });
            
            res.render('reserva/reservaCreate', {
                espacos: espacos.map(e => e.toJSON()),
                recursos: recursos.map(r => r.toJSON())
            });
        } catch (err) {
            console.log(err);
            res.redirect('/home');
        }
    },
    
    // Processar criação de reserva
    async postCreate(req, res) {
        const t = await db.sequelize.transaction();
        
        try {
            // Verificar conflitos de espaço
            const reservasConflitantes = await db.Reserva.findAll({
                where: {
                    espacoId: req.body.espacoId,
                    status: 'confirmada',
                    [Op.or]: [
                        {
                            dataInicio: {
                                [Op.between]: [req.body.dataInicio, req.body.dataFim]
                            }
                        },
                        {
                            dataFim: {
                                [Op.between]: [req.body.dataInicio, req.body.dataFim]
                            }
                        },
                        {
                            [Op.and]: [
                                { dataInicio: { [Op.lte]: req.body.dataInicio } },
                                { dataFim: { [Op.gte]: req.body.dataFim } }
                            ]
                        }
                    ]
                }
            });

            if (reservasConflitantes.length > 0) {
                await t.rollback();
                const espacos = await db.Espaco.findAll({ where: { ativo: true } });
                const recursos = await db.Recurso.findAll();
                
                return res.render('reserva/reservaCreate', {
                    erro: 'Este espaço já está reservado neste período.',
                    espacos: espacos.map(e => e.toJSON()),
                    recursos: recursos.map(r => r.toJSON())
                });
            }

            // Criar reserva
            const reserva = await db.Reserva.create({
                titulo: req.body.titulo,
                dataInicio: req.body.dataInicio,
                dataFim: req.body.dataFim,
                descricao: req.body.descricao,
                status: req.body.status || 'pendente',
                usuarioId: req.session.userId,
                espacoId: req.body.espacoId
            }, { transaction: t });
            
            // Adicionar recursos se selecionados
            if (req.body.recursos) {
                const recursosIds = Array.isArray(req.body.recursos) ? req.body.recursos : [req.body.recursos];
                const quantidades = req.body.quantidades || {};
                
                for (const recursoId of recursosIds) {
                    const quantidade = quantidades[recursoId] || 1;
                    await db.ReservaRecurso.create({
                        reservaId: reserva.id,
                        recursoId: recursoId,
                        quantidade: quantidade
                    }, { transaction: t });
                }
            }
            
            await t.commit();
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'reserva_criada',
                req.ip,
                { 
                    titulo: req.body.titulo,
                    espacoId: req.body.espacoId
                }
            );
            
            res.redirect('/reservaList');
        } catch (err) {
            await t.rollback();
            console.log(err);
            res.redirect('/reservaCreate');
        }
    },
    
    // Listar reservas
    async getList(req, res) {
        try {
            let where = {};
            
            // Se não for admin, mostrar apenas reservas do usuário
            if (req.session.userType !== 1) {
                where.usuarioId = req.session.userId;
            }
            
            const reservas = await db.Reserva.findAll({
                where,
                include: [
                    { model: db.Usuario },
                    { model: db.Espaco },
                    { 
                        model: db.Recurso,
                        as: 'recursos',
                        through: { attributes: ['quantidade'] }
                    }
                ],
                order: [['dataInicio', 'DESC']]
            });
            
            res.render('reserva/reservaList', {
                reservas: reservas.map(reserva => {
                    const data = reserva.toJSON();
                    return {
                        ...data,
                        dataInicioFormatada: new Date(data.dataInicio).toLocaleString('pt-BR'),
                        dataFimFormatada: new Date(data.dataFim).toLocaleString('pt-BR')
                    };
                }),
                isAdmin: req.session.userType === 1
            });
        } catch (err) {
            console.log(err);
            res.redirect('/home');
        }
    },
    
    // Formulário de edição
    async getUpdate(req, res) {
        try {
            const reserva = await db.Reserva.findByPk(req.params.id, {
                include: [{
                    model: db.Recurso,
                    as: 'recursos',
                    through: { attributes: ['quantidade'] }
                }]
            });
            
            if (!reserva) {
                return res.redirect('/reservaList');
            }
            
            const espacos = await db.Espaco.findAll({
                where: { ativo: true },
                order: [['nome', 'ASC']]
            });
            
            const recursos = await db.Recurso.findAll({
                order: [['nome', 'ASC']]
            });
            
            // Preparar dados dos recursos selecionados - CORRIGIR AQUI
            const recursosReserva = {};
            if (reserva.recursos && Array.isArray(reserva.recursos)) {
                reserva.recursos.forEach(r => {
                    if (r && r.ReservaRecurso && r.ReservaRecurso.quantidade) {
                        recursosReserva[r.id] = r.ReservaRecurso.quantidade;
                    }
                });
            }
            
            res.render('reserva/reservaUpdate', {
                reserva: {
                    ...reserva.dataValues,
                    dataInicio: reserva.dataInicio.toISOString().slice(0, 16),
                    dataFim: reserva.dataFim.toISOString().slice(0, 16)
                },
                espacos: espacos.map(e => e.toJSON()),
                recursos: recursos.map(r => r.toJSON()),
                recursosReserva,
                isAdmin: req.session.userType === 1
            });
        } catch (err) {
            console.log(err);
            res.redirect('/reservaList');
        }
    },
    
    // Processar atualização
    async postUpdate(req, res) {
        const t = await db.sequelize.transaction();
        
        try {
            await db.Reserva.update({
                titulo: req.body.titulo,
                dataInicio: req.body.dataInicio,
                dataFim: req.body.dataFim,
                descricao: req.body.descricao,
                status: req.body.status,
                espacoId: req.body.espacoId
            }, { 
                where: { id: req.body.id },
                transaction: t
            });
            
            // Remover recursos antigos
            await db.ReservaRecurso.destroy({
                where: { reservaId: req.body.id },
                transaction: t
            });
            
            // Adicionar novos recursos
            if (req.body.recursos) {
                const recursosIds = Array.isArray(req.body.recursos) ? req.body.recursos : [req.body.recursos];
                const quantidades = req.body.quantidades || {};
                
                for (const recursoId of recursosIds) {
                    const quantidade = quantidades[recursoId] || 1;
                    await db.ReservaRecurso.create({
                        reservaId: req.body.id,
                        recursoId: recursoId,
                        quantidade: quantidade
                    }, { transaction: t });
                }
            }
            
            await t.commit();
            res.redirect('/reservaList');
        } catch (err) {
            await t.rollback();
            console.log(err);
            res.redirect('/reservaUpdate/' + req.body.id);
        }
    },
    
    // Tela de exclusão
    async getDelete(req, res) {
        try {
            const reserva = await db.Reserva.findByPk(req.params.id, {
                include: [
                    { model: db.Usuario },
                    { model: db.Espaco },
                    { 
                        model: db.Recurso,
                        as: 'recursos',
                        through: { attributes: ['quantidade'] }
                    }
                ]
            });
            
            if (!reserva) {
                return res.redirect('/reservaList');
            }
            
            res.render('reserva/reservaDelete', {
                reserva: {
                    ...reserva.toJSON(),
                    dataInicioFormatada: new Date(reserva.dataInicio).toLocaleString('pt-BR'),
                    dataFimFormatada: new Date(reserva.dataFim).toLocaleString('pt-BR')
                }
            });
        } catch (err) {
            console.log(err);
            res.redirect('/reservaList');
        }
    },
    
    // Confirmar exclusão
    async postDelete(req, res) {
        try {
            await db.Reserva.destroy({ 
                where: { id: req.body.id }
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'reserva_excluida',
                req.ip,
                { id: req.body.id }
            );
            
            res.redirect('/reservaList');
        } catch (err) {
            console.log(err);
            res.redirect('/reservaList');
        }
    },
    
    // Alterar status da reserva (admin)
    async getChangeStatus(req, res) {
        try {
            const { id, status } = req.params;
            
            if (!['confirmada', 'pendente', 'cancelada'].includes(status)) {
                return res.redirect('/reservaList');
            }
            
            await db.Reserva.update({ status }, {
                where: { id }
            });
            
            res.redirect('/reservaList');
        } catch (err) {
            console.log(err);
            res.redirect('/reservaList');
        }
    }
};

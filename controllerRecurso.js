const db = require('../config/db_sequelize');
const controllerLog = require('./controllerLog');

module.exports = {
    // Formulário de criação
    async getCreate(req, res) {
        res.render('recurso/recursoCreate');
    },
    
    // Processar criação
    async postCreate(req, res) {
        try {
            await db.Recurso.create({
                nome: req.body.nome,
                descricao: req.body.descricao,
                quantidade: req.body.quantidade
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'recurso_criado',
                req.ip,
                { nome: req.body.nome, quantidade: req.body.quantidade }
            );
            
            res.redirect('/recursoList');
        } catch (err) {
            console.log(err);
            res.render('recurso/recursoCreate', {
                erro: 'Erro ao criar recurso. Verifique os dados.'
            });
        }
    },
    
    // Listar recursos
    async getList(req, res) {
        try {
            const recursos = await db.Recurso.findAll({
                order: [['nome', 'ASC']]
            });
            
            res.render('recurso/recursoList', {
                recursos: recursos.map(recurso => recurso.toJSON())
            });
        } catch (err) {
            console.log(err);
            res.redirect('/home');
        }
    },
    
    // Formulário de edição
    async getUpdate(req, res) {
        try {
            const recurso = await db.Recurso.findByPk(req.params.id);
            
            if (!recurso) {
                return res.redirect('/recursoList');
            }
            
            res.render('recurso/recursoUpdate', {
                recurso: recurso.dataValues
            });
        } catch (err) {
            console.log(err);
            res.redirect('/recursoList');
        }
    },
    
    // Processar atualização
    async postUpdate(req, res) {
        try {
            await db.Recurso.update({
                nome: req.body.nome,
                descricao: req.body.descricao,
                quantidade: req.body.quantidade
            }, {
                where: { id: req.body.id }
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'recurso_atualizado',
                req.ip,
                { id: req.body.id, nome: req.body.nome }
            );
            
            res.redirect('/recursoList');
        } catch (err) {
            console.log(err);
            res.redirect('/recursoUpdate/' + req.body.id);
        }
    },
    
    // Tela de exclusão
    async getDelete(req, res) {
        try {
            const recurso = await db.Recurso.findByPk(req.params.id);
            
            if (!recurso) {
                return res.redirect('/recursoList');
            }
            
            res.render('recurso/recursoDelete', {
                recurso: recurso.dataValues
            });
        } catch (err) {
            console.log(err);
            res.redirect('/recursoList');
        }
    },
    
    // Confirmar exclusão
    async postDelete(req, res) {
        try {
            // Verificar se há reservas usando este recurso
            const reservasComRecurso = await db.ReservaRecurso.count({
                where: { recursoId: req.body.id }
            });
            
            if (reservasComRecurso > 0) {
                const recurso = await db.Recurso.findByPk(req.body.id);
                return res.render('recurso/recursoDelete', {
                    recurso: recurso.dataValues,
                    erro: 'Não é possível excluir este recurso pois está sendo usado em reservas.'
                });
            }
            
            await db.Recurso.destroy({
                where: { id: req.body.id }
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'recurso_excluido',
                req.ip,
                { id: req.body.id }
            );
            
            res.redirect('/recursoList');
        } catch (err) {
            console.log(err);
            res.redirect('/recursoList');
        }
    },
    
    // API para verificar disponibilidade
    async checkDisponibilidade(req, res) {
        try {
            const { recursoId, dataInicio, dataFim } = req.query;
            
            // Buscar total de recursos
            const recurso = await db.Recurso.findByPk(recursoId);
            
            if (!recurso) {
                return res.json({ disponivel: false, quantidade: 0 });
            }
            
            // Buscar reservas confirmadas no período
            const reservasNoPeriodo = await db.Reserva.findAll({
                where: {
                    status: 'confirmada',
                    [db.Sequelize.Op.or]: [
                        {
                            dataInicio: {
                                [db.Sequelize.Op.between]: [dataInicio, dataFim]
                            }
                        },
                        {
                            dataFim: {
                                [db.Sequelize.Op.between]: [dataInicio, dataFim]
                            }
                        }
                    ]
                },
                include: [{
                    model: db.Recurso,
                    as: 'recursos',
                    where: { id: recursoId },
                    through: { attributes: ['quantidade'] }
                }]
            });
            
            // Calcular quantidade já reservada
            let quantidadeReservada = 0;
            reservasNoPeriodo.forEach(reserva => {
                reserva.recursos.forEach(rec => {
                    quantidadeReservada += rec.ReservaRecurso.quantidade;
                });
            });
            
            const quantidadeDisponivel = recurso.quantidade - quantidadeReservada;
            
            res.json({
                disponivel: quantidadeDisponivel > 0,
                quantidade: quantidadeDisponivel,
                total: recurso.quantidade
            });
            
        } catch (err) {
            console.log(err);
            res.json({ erro: 'Erro ao verificar disponibilidade' });
        }
    }
};
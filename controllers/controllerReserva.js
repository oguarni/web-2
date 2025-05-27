const db = require('../config/db_sequelize');
const { Op } = require('sequelize');
const controllerLog = require('./controllerLog');
const path = require('path');

module.exports = {
    // Create reservation form
    async getCreate(req, res) {
        res.render('reserva/reservaCreate');
    },
    
    // Process reservation creation
    async postCreate(req, res) {
        try {
            // Check for conflicting reservations
            const reservasConflitantes = await db.Reserva.findAll({
                where: {
                    local: req.body.local,
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
                return res.render('reserva/reservaCreate', {
                    erro: 'Este local já está reservado neste período.'
                });
            }

            await db.Reserva.create({
                titulo: req.body.titulo,
                dataInicio: req.body.dataInicio,
                dataFim: req.body.dataFim,
                descricao: req.body.descricao,
                local: req.body.local,
                status: req.body.status || 'pendente',
                usuarioId: req.session.userId // Current logged user
            });
            
            // Registrar log de criação de reserva
            controllerLog.registrarLog(
                req.session.userId,
                'reserva_criada',
                req.ip,
                { 
                    titulo: req.body.titulo,
                    local: req.body.local
                }
            );
            
            res.redirect('/reservaList');
        } catch (err) {
            console.log(err);
            res.redirect('/reservaCreate');
        }
    },
    
    // List reservations (filtered by user type)
    async getList(req, res) {
        try {
            let where = {};
            
            // If not admin, show only user's reservations
            if (req.session.userType !== 1) {
                where.usuarioId = req.session.userId;
            }
            
            const reservas = await db.Reserva.findAll({
                where,
                include: [
                    { model: db.Usuario }
                ]
            });
            
            res.render('reserva/reservaList', {
                reservas: reservas.map(reserva => {
                    const data = reserva.toJSON();
                    return {
                        ...data,
                        dataInicioFormatada: new Date(data.dataInicio).toLocaleString(),
                        dataFimFormatada: new Date(data.dataFim).toLocaleString()
                    };
                }),
                isAdmin: req.session.userType === 1
            });
        } catch (err) {
            console.log(err);
            res.redirect('/home');
        }
    },
    
    // Edit reservation form
    async getUpdate(req, res) {
        try {
            const reserva = await db.Reserva.findByPk(req.params.id);
            
            res.render('reserva/reservaUpdate', {
                reserva: reserva.dataValues,
                isAdmin: req.session.userType === 1
            });
        } catch (err) {
            console.log(err);
            res.redirect('/reservaList');
        }
    },
    
    // Process reservation update
    async postUpdate(req, res) {
        try {
            await db.Reserva.update(req.body, { 
                where: { id: req.body.id }
            });
            
            res.redirect('/reservaList');
        } catch (err) {
            console.log(err);
            res.redirect('/reservaUpdate/' + req.body.id);
        }
    },
    
    // Delete reservation
    async getDelete(req, res) {
        try {
            await db.Reserva.destroy({ 
                where: { id: req.params.id }
            });
            
            res.redirect('/reservaList');
        } catch (err) {
            console.log(err);
            res.redirect('/reservaList');
        }
    },
    
    // Change reservation status (admin only)
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
}
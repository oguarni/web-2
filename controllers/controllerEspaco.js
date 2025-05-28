const db = require('../config/db_sequelize');
const controllerLog = require('./controllerLog');

module.exports = {
    // Formulário de criação
    async getCreate(req, res) {
        res.render('espaco/espacoCreate');
    },
    
    // Processar criação
    async postCreate(req, res) {
        try {
            await db.Espaco.create({
                nome: req.body.nome,
                descricao: req.body.descricao,
                capacidade: req.body.capacidade,
                tipo: req.body.tipo,
                ativo: req.body.ativo !== undefined ? req.body.ativo : true
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'espaco_criado',
                req.ip,
                { nome: req.body.nome, tipo: req.body.tipo }
            );
            
            res.redirect('/espacoList');
        } catch (err) {
            console.log(err);
            res.render('espaco/espacoCreate', {
                erro: 'Erro ao criar espaço. Verifique os dados.'
            });
        }
    },
    
    // Listar espaços
    async getList(req, res) {
        try {
            const espacos = await db.Espaco.findAll({
                order: [['nome', 'ASC']]
            });
            
            res.render('espaco/espacoList', {
                espacos: espacos.map(espaco => espaco.toJSON())
            });
        } catch (err) {
            console.log(err);
            res.redirect('/home');
        }
    },
    
    // Formulário de edição
    async getUpdate(req, res) {
        try {
            const espaco = await db.Espaco.findByPk(req.params.id);
            
            if (!espaco) {
                return res.redirect('/espacoList');
            }
            
            res.render('espaco/espacoUpdate', {
                espaco: espaco.dataValues
            });
        } catch (err) {
            console.log(err);
            res.redirect('/espacoList');
        }
    },
    
    // Processar atualização
    async postUpdate(req, res) {
        try {
            await db.Espaco.update({
                nome: req.body.nome,
                descricao: req.body.descricao,
                capacidade: req.body.capacidade,
                tipo: req.body.tipo,
                ativo: req.body.ativo === 'true'
            }, {
                where: { id: req.body.id }
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'espaco_atualizado',
                req.ip,
                { id: req.body.id, nome: req.body.nome }
            );
            
            res.redirect('/espacoList');
        } catch (err) {
            console.log(err);
            res.redirect('/espacoUpdate/' + req.body.id);
        }
    },
    
    // Deletar espaço
    async getDelete(req, res) {
        try {
            const espaco = await db.Espaco.findByPk(req.params.id);
            
            if (!espaco) {
                return res.redirect('/espacoList');
            }
            
            res.render('espaco/espacoDelete', {
                espaco: espaco.dataValues
            });
        } catch (err) {
            console.log(err);
            res.redirect('/espacoList');
        }
    },
    
    // Confirmar exclusão
    async postDelete(req, res) {
        try {
            // Verificar se há reservas para este espaço
            const reservas = await db.Reserva.count({
                where: { espacoId: req.body.id }
            });
            
            if (reservas > 0) {
                const espaco = await db.Espaco.findByPk(req.body.id);
                return res.render('espaco/espacoDelete', {
                    espaco: espaco.dataValues,
                    erro: 'Não é possível excluir este espaço pois existem reservas associadas.'
                });
            }
            
            await db.Espaco.destroy({
                where: { id: req.body.id }
            });
            
            // Registrar log
            await controllerLog.registrarLog(
                req.session.userId,
                'espaco_excluido',
                req.ip,
                { id: req.body.id }
            );
            
            res.redirect('/espacoList');
        } catch (err) {
            console.log(err);
            res.redirect('/espacoList');
        }
    }
};
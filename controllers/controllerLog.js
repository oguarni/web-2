const mongoose = require('mongoose');
const db_mongoose = require('../config/db_mongoose');
const Log = require('../models/noSql/log');

// Conectar ao MongoDB
mongoose.connect(db_mongoose.connection).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((err) => {
    console.log('Erro na conexão com o MongoDB:', err);
});

module.exports = {
    // Registrar log no sistema
    async registrarLog(usuarioId, acao, ip, detalhes) {
        try {
            const novoLog = new Log({
                usuarioId,
                acao,
                ip,
                detalhes
            });
            
            await novoLog.save();
            return true;
        } catch (err) {
            console.log('Erro ao registrar log:', err);
            return false;
        }
    },
    
    // Listar todos os logs (apenas admin)
    async getList(req, res) {
        try {
            const logs = await Log.find().sort({ timestamp: -1 });
            
            res.render('log/logList', { 
                logs: logs.map(log => ({
                    ...log.toObject(),
                    timestampFormatado: new Date(log.timestamp).toLocaleString()
                }))
            });
        } catch (err) {
            console.log(err);
            res.redirect('/home');
        }
    }
}
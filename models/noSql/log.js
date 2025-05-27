const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    usuarioId: { 
        type: Number, 
        required: true 
    },
    acao: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    ip: { 
        type: String 
    },
    detalhes: { 
        type: Schema.Types.Mixed 
    }
});

module.exports = mongoose.model("Log", LogSchema);
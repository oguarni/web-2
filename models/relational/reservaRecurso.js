const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReservaRecurso = sequelize.define('reserva_recurso', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  reservaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reservas',
      key: 'id'
    }
  },
  recursoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recursos',
      key: 'id'
    }
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1 // Garantir que a quantidade seja pelo menos 1
    }
  }
}, {
  tableName: 'reserva_recursos' // Nome explícito da tabela se necessário
});

module.exports = ReservaRecurso;
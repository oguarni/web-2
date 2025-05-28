#!/bin/bash
echo "🐳 Configurando para DOCKER..."
pkill -f "node app.js" 2>/dev/null || true

# Config PostgreSQL DOCKER
cat > config/db_sequelize.js << 'EOL'
const Sequelize = require('sequelize');
const sequelize = new Sequelize('web2_db', 'postgres', '1234', {
    host: 'postgres',
    port: 5432,
    dialect: 'postgres',
    logging: false
});
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Usuario = require('../models/relational/usuario.js')(sequelize, Sequelize);
db.Espaco = require('../models/relational/espaco.js')(sequelize, Sequelize);
db.Reserva = require('../models/relational/reserva.js')(sequelize, Sequelize);
db.Recurso = require('../models/relational/recurso.js')(sequelize, Sequelize);
db.ReservaRecurso = require('../models/relational/reservaRecurso.js')(sequelize, Sequelize);
db.Usuario.hasMany(db.Reserva, { foreignKey: 'usuarioId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'usuarioId' });
db.Espaco.hasMany(db.Reserva, { foreignKey: 'espacoId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Espaco, { foreignKey: 'espacoId' });
db.Reserva.belongsToMany(db.Recurso, { through: db.ReservaRecurso, foreignKey: 'reservaId', otherKey: 'recursoId', as: 'recursos' });
db.Recurso.belongsToMany(db.Reserva, { through: db.ReservaRecurso, foreignKey: 'recursoId', otherKey: 'reservaId', as: 'reservas' });
console.log('🔗 PostgreSQL DOCKER'); module.exports = db;
EOL

# Config MongoDB DOCKER
cat > config/db_mongoose.js << 'EOL'
const StringCon = { connection: "mongodb://mongodb:27017/reservas_db" }
console.log('🍃 MongoDB DOCKER'); module.exports = StringCon;
EOL

# App DOCKER
cat > app.js << 'EOL'
const routes = require('./routers/route');
const handlebars = require('express-handlebars');
const express = require('express');
const session = require('express-session');
const app = express();
const hbs = handlebars.create({
    defaultLayout: 'main',
    helpers: {
        eq: function (a, b) { return a === b; },
        or: function (a, b) { return a || b; },
        and: function (a, b) { return a && b; },
        unless: function(conditional, options) { if(!conditional) return options.fn(this); },
        lookup: function(obj, field) { return obj && obj[field]; }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine','handlebars');
app.use(session({ secret: 'sistema-reservas-espacos', resave: false, saveUninitialized: false, cookie: { maxAge: 3600000 } }));
app.use((req, res, next) => { res.locals.session = req.session; next(); });
app.use(express.json()); app.use(express.urlencoded({ extended: true })); app.use(routes);
app.listen(8081, () => console.log("�� DOCKER: http://localhost:8081"));
EOL

echo "✅ Configurado para DOCKER"
docker-compose build
docker-compose up -d
docker-compose logs -f app

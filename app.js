const routes = require('./routers/route');
const handlebars = require('express-handlebars');
const express = require('express');
const session = require('express-session');
const app = express();

// Configuração do Handlebars
app.engine('handlebars', handlebars.engine({defaultLayout:'main'}));
app.set('view engine','handlebars');

// Configuração de sessão para controle de acesso
app.use(session({
    secret: 'sistema-reservas-espacos',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hora
}));

// Middleware para disponibilizar variáveis de sessão em todas as views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware para processar JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use(routes);

// Iniciar servidor
app.listen(8081, function(){
    console.log("Servidor no http://localhost:8081");
});
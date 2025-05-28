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

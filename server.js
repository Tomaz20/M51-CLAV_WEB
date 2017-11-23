//Basic webserver
var express = require('express'),
    app = express();

app.enable('trust proxy');

//body parser for post requests
var bodyParser = require('body-parser')
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//authentication dependencies
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

//config
app.set('view engine', 'pug');
app.set('views', __dirname + '/Pages');

//standard
app.use(express.static(__dirname + '/Client'));
app.use("/styles", express.static(__dirname + '/Styles'));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Connect Flash
app.use(flash());


// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.warn_msg = req.flash('warn_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//routes and API
require('./Server/routes')(app);
require('./Server/api/apiOrgs')(app);
require('./Server/api/apiLegs')(app);
require('./Server/api/apiClasses')(app);
require('./Server/api/apiSelTabs')(app);
require('./Server/auth/userRoutes')(app);

module.exports = app;

//Starts and listens
var port = process.env.PORT || 40004;
app.listen(port, function() {
    console.log("Listening on " + port );
});

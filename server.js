//Basic webserver
var express = require('express'),
    app = express();

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
var LocalStrategy = require('passport-local').Strategy;
var users = require('./Server/users');

//routes and API
require('./Server/routes')(app);
require('./Server/api/apiOrgs')(app);
require('./Server/api/apiLegs')(app);
require('./Server/api/apiClasses')(app);
require('./Server/api/apiSelTabs')(app);
require('./Server/api/apiUsers')(app);

module.exports = app;

//config
app.set('view engine', 'pug');
app.set('views', __dirname);

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
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


//Starts and listens
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on " + port );
});
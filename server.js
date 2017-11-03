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

//routes and API
require('./Server/routes')(app);
require('./Server/apiOrgs')(app);
require('./Server/apiLegs')(app);
require('./Server/apiClasses')(app);
require('./Server/apiSelTabs')(app);

module.exports = app;

//config
app.set('view engine', 'pug');
app.set('views', __dirname);

//standard
app.use(express.static(__dirname + '/Client'));
app.use("/styles", express.static(__dirname + '/Styles'));

//Starts and listens
var port = process.env.PORT || 3030;
app.listen(port, function() {
    console.log("Listening on " + port );
});

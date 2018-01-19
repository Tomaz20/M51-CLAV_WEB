var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('orgs/listagem');
});

router.get('/adicionar', Auth.isLoggedIn, function(req, res) {
    res.render('orgs/adicao');
});

router.get('/consultar/:id', function(req, res) {
    res.render('orgs/consulta',{orgID: req.params.id});
});


module.exports = router;

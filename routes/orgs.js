var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('orgs/listagem');
});

router.get('/consulta/:id', function(req, res) {
    res.render('orgs/consulta',{orgID: req.params.id});
});

router.get('/criacao', Auth.isLoggedIn, function(req, res) {
    res.render('orgs/adicao');
});


module.exports = router;

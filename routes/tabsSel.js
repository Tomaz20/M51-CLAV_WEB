var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('tabsSel/listagem');
});

router.get('/consulta/:id', function(req, res) {
    res.render('tabsSel/consulta',{tabID: req.params.id});
});

router.get('/criacao', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/adicao');
});


module.exports = router;

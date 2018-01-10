var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('tabsSel/listagem');
});

router.get('/criacao', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/adicao');
});

router.get('/:id', function(req, res) {
    res.render('tabsSel/consulta',{tabID: req.params.id});
});

module.exports = router;

var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('classes/listagem');
});

router.get('/consulta/:id', function(req, res) {
    res.render('classes/consulta',{classID: req.params.id});
});

router.get('/criacao', Auth.isLoggedIn, function(req, res) {
    res.render('classes/adicao');
});


module.exports = router;

var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('classes/listagem', {title: "Lista Consolidada"});
});

router.get('/adicionar', Auth.isLoggedIn, function(req, res) {
    res.render('classes/adicao', {title: "Nova classe"});
});

router.get('/consultar/:id', function(req, res) {
    res.render('classes/consulta',{classID: req.params.id, sidebar: true, title: "Dados de classe"});
});


module.exports = router;

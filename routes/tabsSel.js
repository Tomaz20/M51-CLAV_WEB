var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('tabsSel/listagem');
});

router.get('/submeter', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/escolha');
});

router.get('/submeter/passos', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/passos');
});

router.get('/submeter/escolher_processos', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/escolha_processos');
});

router.get('/submeter/alterar_PNs/:id', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/alterar_PNs');
});

router.get('/adicionar', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/adicao');
});

router.get('/consultar/:id', function(req, res) {
    res.render('tabsSel/consulta',{tabID: req.params.id});
});

module.exports = router;

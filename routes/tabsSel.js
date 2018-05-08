var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('tabsSel/listagem', {title: "Tabelas de Seleção"});
});

router.get('/submeter', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/escolha', {title: "Nova TS"});
});

router.get('/submeter/passos', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/passos', {title: "Nova TS", entidade: "Teste"});
});

router.get('/submeter/escolher_processos', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/escolha_processos', {title: "Nova TS"});
});

router.get('/submeter/alterar_PNs/:id', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/alterar_PNs', {title: "Nova TS"});
});

router.get('/adicionar', Auth.isLoggedIn, function(req, res) {
    res.render('tabsSel/adicao', {title: "Nova TS"});
});

router.get('/consultar/:id', function(req, res) {
    res.render('tabsSel/consulta',{tabID: req.params.id, title: "Dados de TS"});
});

module.exports = router;

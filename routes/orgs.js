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


//----------- TESTE DE PÁGINAS (TEMPORÁRIO) ----------------

router.get('/registo_entidade', function(req, res) {
    res.render('orgs/registo_entidade');
});

router.get('/registo_utilizador', function(req, res) {
    res.render('users/registo_utilizador');
});

router.get('/questionario', function(req, res) {
    res.render('orgs/questionario');
});

router.get('/autenticacao', function(req, res) {
    res.render('orgs/autenticacao');
});

router.get('/autenticacao_email', function(req, res) {
    res.render('orgs/autenticacao_email');
});

router.get('/entidade', function(req, res) {
    res.render('orgs/entidade');
});

router.get('/escolha_processos', function(req, res) {
    res.render('tabsSel/escolha_processos');
});

router.get('/escolha', function(req, res) {
    res.render('tabsSel/escolha');
});

router.get('/passos', function(req, res) {
    res.render('tabsSel/passos');
});

router.get('/alteracao', function(req, res) {
    res.render('tabsSel/alteracao');
});


//----------------------------------------------------------

module.exports = router;

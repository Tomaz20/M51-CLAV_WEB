var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/', function(req, res, next) {
	res.render('orgs/listagem', {title: "Entidades"});
});

router.get('/adicionar', Auth.isLoggedIn, function(req, res) {
    res.render('orgs/adicao', {title: "Nova entidade"});
});

router.get('/consultar/:id', function(req, res) {
    res.render('orgs/consulta',{orgID: req.params.id, title: "Dados de entidade"});
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

router.get('/area_trabalho', function(req, res) {
    res.render('orgs/area_trabalho');
});

router.get('/entidade', function(req, res) {
    res.render('orgs/entidade');
});

//----------------------------------------------------------

module.exports = router;

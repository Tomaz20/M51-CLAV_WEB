var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');

router.get('/registar', function(req, res) {
    res.render('users/registar');
});

router.get('/login', function(req, res) {
    res.render('users/login');
});

router.get('/perfil', Auth.isLoggedIn, function(req, res) {
    res.render('users/perfil');
});

module.exports = router;

var express = require('express');
var router = express.Router();

var Auth = require('../controllers/auth.js');
var User = require('../models/user');

router.get('/registar', function(req, res) {
    res.render('users/registar');
});

router.get('/login', function(req, res) {
    res.render('users/login');
});

router.get('/perfil', Auth.isLoggedIn, function(req, res) {
    res.render('users/perfil');
});

// Guardar trabalho
router.put('/save/:type', Auth.isLoggedInAPI, function (req, res) {
    User.getUserById(req.user._id, function(err, user){

		if (err) {	
			throw err;
		}
		else if (!user) {
			return done(null, false, { message: 'Ocorreu um erro ao guardar a informação' });
		}
		else {
            user.savedStates[req.params.type]=req.body;

            user.save(function(err,updatedUser){
                if(err) {	
                    throw err;
                }
                res.send(updatedUser.savedStates[req.params.type]);
            });
        }
	});
});

// Carregar trabalho
router.get('/load/:type', Auth.isLoggedInAPI, function (req, res) {
    res.send(req.user.savedStates[req.params.type]);
});

module.exports = router;

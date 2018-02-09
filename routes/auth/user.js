var Logging = require('../../controllers/logging');
var passport = require('passport');

var express = require('express');
var router = express.Router();

var User = require('../../models/user');

// Local user registration
router.post('/registar', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Nome é obrigatório').notEmpty();
    req.checkBody('email', 'Email é obrigatório').notEmpty();
    req.checkBody('email', 'Email inválido').isEmail();
    req.checkBody('password', 'Password é obrigatória').notEmpty();
    req.checkBody('password2', 'Passwords têm de ser iguais').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('users/registar', {
            errors: errors
        });
    }
    else {
        var newUser = new User({
            name: name,
            level: 1,
            email: email,
            local: {
                password: password
            }
        });

        User.getUserByEmail(email, function (err, user) {
            if (err) throw err;
            if (!user) {
                User.createUser(newUser, function (err, user) {
                    Logging.logger.info('Utilizador ' + user._id + ' registado.');

                    if (err) throw err;
                });

                req.flash('success_msg', 'A sua conta foi criada, pode agora fazer login');

                res.redirect('/');
            }
            else {
                res.render('users/registar', {
                    errors: [{ msg: "Email já em uso" }]
                });
            }
        });
    }
});

// Local authentication
router.post('/login',
    passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: true }),
    function (req, res) {
        res.redirect('/');
    }
);

// Facebook authentication
router.get('/loginFB', passport.authenticate(
    'facebook',
    passport.authorize('facebook', {
        scope: ['email']
    })
));

router.get('/loginFB/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);

// Google authentication
router.get('/loginG', passport.authenticate(
    'google',
    { scope: ['profile', 'email'] }
));

router.get('/loginG/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);

router.get('/logout', function (req, res) {
    var url = require('url');
    var parts = url.parse(req.url, true);
    var location = parts.query.l;

    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect(location);
});


module.exports = router;
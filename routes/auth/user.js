var Logging = require('../../controllers/logging');
var passport = require('passport');

var express = require('express');
var router = express.Router();

var User = require('../../models/user');
var Entidade = require('../../models/entidade');

// Local user registration
router.post('/registar', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var type = req.body.type;
    var internal = (type > 1);
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
            internal: internal,
            level: type,
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


router.get('/logout', function (req, res) {
    var url = require('url');
    var parts = url.parse(req.url, true);
    var location = parts.query.l;

    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect(location);
});


router.post('/submeterEntidade', function (req, res) {
    var errors = [];

    var entity = req.body.entidade;
    var reps = req.body.representantes;

    // Validação
    if (!entity.nome) { errors.push("Campo 'Nome da Entidade' não pode estar vazio"); }
    if (!entity.servico) { errors.push("Campo 'Serviço responsável' não pode estar vazio"); }
    if (!entity.email) { errors.push("Campo 'E-mail do serviço' não pode estar vazio"); }

    for (let rep of reps) {
        if (!rep.nome) { errors.push("Campo 'Nome' de um representante não pode estar vazio"); }
        if (!rep.cc) { errors.push("Campo 'E-mail' de um representante não pode estar vazio"); }
        if (!rep.email) { errors.push("Campo 'Número de CC' de um representante não pode estar vazio"); }

        if (errors.length) { break; }
    }

    if (errors.length) {
        res.send({ errors: errors });
    }
    else {
        var repEmails = reps.map(rep => rep.email);

        var newEntidade = new Entidade({
            nome: entity.nome,
            email: entity.email,
            responsavel: entity.servico,
            representantes: repEmails,
            estado: 0
        });

        Entidade.getEntidadeByEmail(entity.email, function (err, ent) {
            if (err) {console.log(err);}
            if (!ent) {
                Entidade.createEntidade(newEntidade, function (err, ent) {
                    Logging.logger.info('Entidade ' + ent._id + ' submetida para avaliação.');

                    if (err) {console.log(err);}
                });
                req.flash('success_msg', 'Entidade submetida com sucesso!');
                res.send('Entidade submetida com sucesso!');
            }
            else {
                res.send({ errors: ["Email da entidade já em uso!"] });
            }
        });
    }
});
module.exports = router;


/*
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
*/
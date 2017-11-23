var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../users');
var ConfigAuth = require('../config/credentials')

module.exports = function (app) {

    // Local user registration
    app.post('/registar', function (req, res) {
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
            res.render('Users/registar', {
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
                        if (err) throw err;
                    });

                    req.flash('success_msg', 'A sua conta foi criada, pode agora fazer login');

                    res.redirect('/');
                }
                else {
                    res.render('Users/registar', {
                        errors: [{ msg: "Email já em uso" }]
                    });
                }
            });
        }
    });

    // Local authentication
    app.post('/login',
        passport.authenticate('local', { failureFlash: true }),
        function (req, res) {
            res.redirect(req.body.location);
        }
    );

    // Facebook authentication
    app.get('/loginFB', passport.authenticate(
        'facebook',
        passport.authorize('facebook', { 
            scope: ['email'] 
        })
    ));

    app.get('/loginFB/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    );

    // Google authentication
    app.get('/loginG', passport.authenticate(
        'google',
        {scope: ['profile','email']} 
    ));

    app.get('/loginG/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    );

    app.get('/logout', function (req, res) {
        var url = require('url');
        var parts = url.parse(req.url, true);
        var location = parts.query.l;

        req.logout();

        req.flash('success_msg', 'You are logged out');

        res.redirect(location);
    });

    passport.use(new LocalStrategy(
        function (email, password, done) {
            User.getUserByEmail(email, function (err, user) {
                if (err) throw err;
                if (!user) {
                    return done(null, false, { message: 'Email não reconhecido' });
                }

                User.comparePassword(password, user.local.password, function (err, isMatch) {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password Inválida' });
                    }
                });
            });
        })
    );

    passport.use(new FacebookStrategy(
        {
            clientID: ConfigAuth.facebookAuth.ID,
            clientSecret: ConfigAuth.facebookAuth.Secret,
            callbackURL: ConfigAuth.facebookAuth.callbackURL,
            passReqToCallback : true,
            profileFields: ['id', 'emails', 'name']
        },
        function (req, accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                
                var newUser = new User({
                    level: 1,
                    email: profile.emails[0].value,
                    name: profile.name.givenName + ' ' + profile.name.familyName,
                    facebook: {
                        id: profile.id,
                        token: accessToken
                    }
                })

                User.findOne({'facebook.id': profile.id}, function(err, user){
                    if (err)
                        return done(err);
                    if (user)
                        return done(null, user);
                    else {
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        })
                        console.log(profile);
                    }
                })
            });
        }

    ));

    passport.use(new GoogleStrategy(
        {
            clientID: ConfigAuth.googleAuth.ID,
            clientSecret: ConfigAuth.googleAuth.Secret,
            callbackURL: ConfigAuth.googleAuth.callbackURL,
            passReqToCallback : true,
            profileFields: ['id', 'emails', 'name']
        },
        function (req, accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                
                var newUser = new User({
                    level: 1,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    google: {
                        id: profile.id,
                        token: accessToken
                    }
                })

                User.findOne({'google.id': profile.id}, function(err, user){
                    if (err)
                        return done(err);
                    if (user)
                        return done(null, user);
                    else {
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        })
                        console.log(profile);
                    }
                })
            });
        }

    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.getUserById(id, function (err, user) {
            done(err, user);
        });
    });
}
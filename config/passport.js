var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user');
var ConfigAuth = require('./credentials');

module.exports = function(passport) {

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

};
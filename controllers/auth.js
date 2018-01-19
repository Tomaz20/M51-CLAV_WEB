var Auth = module.exports

Auth.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('warn_msg', 'Login necessário para aceder a esta página');
    res.redirect('/users/login');
}

Auth.checkLevel2 = function (req, res, next) {
    return isLevel(2, req, res, next);
}

Auth.checkLevel3 = function (req, res, next) {
    return isLevel(3, req, res, next);
}

Auth.checkLevel4 = function (req, res, next) {
    return isLevel(4, req, res, next);
}

Auth.isLevel = function (clearance, req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.level >= clearance) {
            return next();
        }
        else {
            req.flash('warn_msg', 'Não tem permissões suficientes para aceder a esta página');
            res.redirect('back');
        }
    }
    else {
        req.flash('warn_msg', 'Login necessário para aceder a esta página');
        res.redirect('/users/login');
    }
}

Auth.isLoggedInAPI = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send('Login necessário para esta operação');
}
var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var TermosIndice = require('../../controllers/api/termosIndice.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    TermosIndice.list()
        .then(tis => res.send(tis))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/filtrar/:clas', function (req, res) {
    TermosIndice.fromClass(req.params.clas)
        .then(tis => res.send(tis))
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;
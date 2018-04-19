var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var Vocabulario = require('../../controllers/api/vocabulario.js');

var express = require('express');
var router = express.Router();


router.get('/formasContagemPCA', function (req, res) {
    Vocabulario.formasContagemPCA()
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;
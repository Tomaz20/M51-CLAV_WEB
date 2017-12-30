var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var Classes = require('../../controllers/api/classes.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    Classes.list(1)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/level=:level', function (req, res) {
    Classes.list(req.params.level)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id', function (req, res) {
    Classes.stats(req.params.id)
        .then(clas => res.send(clas))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/children', function (req, res) {
    Classes.children(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/owners', function (req, res) {
    Classes.owners(req.params.id)
        .then(owners => res.send(owners))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/legislation', function (req, res) {
    Classes.legislation(req.params.id)
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/exAppNotes', function (req, res) {
    Classes.exAppNotes(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/appNotes', function (req, res) {
    Classes.appNotes(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/delNotes', function (req, res) {
    Classes.delNotes(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/related', function (req, res) {
    Classes.related(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/participants', function (req, res) {
    Classes.participants(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.put('/update', Auth.isLoggedInAPI, function (req, res) {
    Classes.updateClass(req.body.dataObj)
        .then(function (response) {
            var id = req.body.dataObj.id;
            Logging.logger.info('Update a classe \'' + id + '\' por utilizador \'' + req.user._id + '\'');

            req.flash('success_msg', 'Info. de Classe actualizada');
            res.send("Actualizado!");
        })
        .catch(error => console.error(error));
})

router.post('/create', Auth.isLoggedInAPI, function (req, res) {
    var dataObj = req.body;

    Classes.checkCodeAvailability(dataObj.Code)
        .then(function (count) {
            if (count > 0) {
                res.send("Código já existente!");
            }
            else {
                Classes.createClass(dataObj)
                    .then(function () {
                        Logging.logger.info('Criada classe \'c' + dataObj.Code + '\' por utilizador \'' + req.user._id + '\'');

                        req.flash('success_msg', 'Classe inserida');
                        res.send("Classe Inserida!");
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error("Erro a checkar o codigo: " + error))

})

router.post('/delete', Auth.isLoggedInAPI, function (req, res) {
    Classes.deleteClass(req.body.id)
        .then(function () {
            Logging.logger.info('Apagada classe \'' + req.body.id + '\' por utilizador \'' + req.user._id + '\'');

            req.flash('success_msg', 'Entrada apagada');
            res.send("Entrada apagada!");
        })
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;
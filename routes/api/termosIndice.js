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
/*
router.get('/:id', function (req, res) {
    TermosIndice.stats(req.params.id).then(leg => res.send(leg))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/regula', function (req, res) {
    TermosIndice.regulates(req.params.id)
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

router.post('/', Auth.isLoggedInAPI, function (req, res) {
    function genID(ids) {
        var newIDNum = 1;

        var list = ids
            .map(item => parseInt(
                item.id.value.replace(/[^#]+#leg_(.*)/, '$1')
            ))
            .sort((a, b) => a - b);


        for (var i = 0; i < list.length; i++) {
            var idNum = list[i];

            if (newIDNum == idNum) {
                newIDNum++;
            }
            else {
                break;
            }
        }
        return "leg_" + newIDNum;
    }

    var dataObj = req.body;

    TermosIndice.checkNumberAvailability(dataObj.number)
        .then(function (count) {
            if (count > 0) {
                res.send("Número já existente!");
            }
            else {
                TermosIndice.list()
                    .then(function (ids) {
                        var newID = genID(ids)

                        TermosIndice.createDoc(newID, dataObj)
                            .then(function () {
                                Logging.logger.info('Criada legislação \'' + newID + '\' por utilizador \'' + req.user._id + '\'');

                                req.flash('success_msg', 'Documento inserido');
                                res.send(newID);
                            })
                            .catch(error => console.error(error));

                    })
                    .catch(error => console.error("newID error: \n\t" + error))
            }
        })
        .catch(error => console.error("General error:\n" + error));
})

router.put('/:id', Auth.isLoggedInAPI, function (req, res) {
    var dataObj = req.body;

    if (dataObj.number) {
        TermosIndice.checkNumberAvailability(dataObj.number)
            .then(function (count) {
                if (count > 0) {
                    res.send("Número já existente!");
                }
                else {
                    TermosIndice.updateDoc(dataObj)
                        .then(function () {
                            Logging.logger.info('Update a TermosIndiceislação \'' + req.params.id + '\' por utilizador \'' + req.user._id + '\'');

                            req.flash('success_msg', 'Info. de Documento actualizada');
                            res.send("Actualizado!");
                        })
                        .catch(error => console.error(error));
                }
            })
            .catch(error => console.error("Check error:\n" + error));
    }
    else {
        TermosIndice.updateDoc(dataObj)
            .then(function () {
                Logging.logger.info('Update a TermosIndiceislação \'' + req.params.id + '\' por utilizador \'' + req.user._id + '\'');

                req.flash('success_msg', 'Info. de Documento actualizada');
                res.send("Actualizado!");
            })
            .catch(error => console.error(error));
    }
})

router.delete('/:id', Auth.isLoggedInAPI, function (req, res) {
    TermosIndice.deleteDoc(req.params.id)
        .then(function () {
            Logging.logger.info('Apagada TermosIndiceislação \'' + req.params.id + '\' por utilizador \'' + req.user._id + '\'');

            req.flash('success_msg', 'Entrada apagada');
            res.send("Entrada apagada!");
        })
        .catch(function (error) {
            console.error(error);
        });
})
*/
module.exports = router;
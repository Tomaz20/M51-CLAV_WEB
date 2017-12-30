var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var Leg = require('../../controllers/api/leg.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    Leg.list()
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id', function (req, res) {
    Leg.stats(req.params.id).then(leg => res.send(leg))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/regulates', function (req, res) {
    Leg.regulates(req.params.id)
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

router.post('/create', Auth.isLoggedInAPI, function (req, res) {
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

    Leg.checkNumberAvailability(dataObj.number)
        .then(function (count) {
            if (count > 0) {
                res.send("Número já existente!");
            }
            else {
                Leg.list()
                    .then(function (ids) {
                        var newID = genID(ids)

                        Leg.createDoc(newID, dataObj)
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

router.put('/update', Auth.isLoggedInAPI, function (req, res) {
    var dataObj = req.body;

    if (dataObj.number) {
        Leg.checkNumberAvailability(dataObj.number)
            .then(function (count) {
                if (count > 0) {
                    res.send("Número já existente!");
                }
                else {
                    Leg.updateDoc(dataObj)
                        .then(function () {
                            Logging.logger.info('Update a Legislação \'' + dataObj.id + '\' por utilizador \'' + req.user._id + '\'');

                            req.flash('success_msg', 'Info. de Documento actualizada');
                            res.send("Actualizado!");
                        })
                        .catch(error => console.error(error));
                }
            })
            .catch(error => console.error("Check error:\n" + error));
    }
    else {
        Leg.updateDoc(dataObj)
            .then(function () {
                Logging.logger.info('Update a Legislação \'' + dataObj.id + '\' por utilizador \'' + req.user._id + '\'');

                req.flash('success_msg', 'Info. de Documento actualizada');
                res.send("Actualizado!");
            })
            .catch(error => console.error(error));
    }
})

router.delete('/delete', Auth.isLoggedInAPI, function (req, res) {
    var id = req.body.id;

    Leg.deleteDoc(id)
        .then(function () {
            Logging.logger.info('Apagada Legislação \'' + id + '\' por utilizador \'' + req.user._id + '\'');

            req.flash('success_msg', 'Entrada apagada');
            res.send("Entrada apagada!");
        })
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;
var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var SelTabs = require('../../controllers/api/tabsSel.js');
var Classes = require('../../controllers/api/classes.js');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    SelTabs.list()
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/classes', function (req, res) {
    SelTabs.listClasses(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/classes/:parent/descendencia', function (req, res) {
    SelTabs.classChildren(req.params.parent,req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id', function (req, res) {
    SelTabs.stats(req.params.id)
        .then(result => res.send(result))
        .catch(function (error) {
            console.error(error);
        });
})

router.post('/', Auth.isLoggedInAPI, function (req, res) {
    //generate a new ID
    function genID(ids) {
        var newIDNum = 1;

        var list = ids
            .map(item => parseInt(
                item.id.value.replace(/[^#]+#ts_(.*)/, '$1')
            )).sort((a, b) => a - b)

        for (var i = 0; i < list.length; i++) {
            var idNum = list[i];

            if (newIDNum == idNum) {
                newIDNum++;
            }
            else {
                break;
            }
        }
        return "ts_" + newIDNum;
    }

    var dataObj = req.body;

    SelTabs.list()
        .then(function (list) {
            var id = genID(list);

            Classes.completeData(dataObj.classes)
                .then(function(classes){

                    SelTabs.createTab(id, dataObj.name, classes)
                        .then(function () {
                            Logging.logger.info('Criada Tabela de Seleção \'' + id + '\' por utilizador \'' + req.user._id + '\'');

                            req.flash('success_msg', 'Tabela de Seleção criada');
                            res.send(id);
                        })
                        .catch(error => console.error(error)
                        );
                })
                .catch(error => console.error(error)
                );
        })
        .catch(error => console.error(error)
        );
})

module.exports = router;
var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var Orgs = require('../../controllers/api/orgs.js');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    Orgs.list()
        .then(orgs => res.send(orgs))
        .catch(function (error) {
            console.error("Chamada a Listagem: " + error);
        });
})

router.get('/:id', function (req, res) {
    Orgs.stats(req.params.id)
        .then(org => res.send(org))
        .catch(function (error) {
            console.error("Chamada de dados de uma org: " + error);
        });
})

router.get('/:id/conjuntos', function (req, res) {
    Orgs.inConjs(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error("Chamada de conjuntos a que x pertence: " + error);
        });
})

router.get('/:id/tipologias', function (req, res) {
    Orgs.inTipols(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error("Chamada de tipologias a que x pertence: " + error);
        });
})

router.get('/:id/elementos', function (req, res) {
    Orgs.elems(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error("Chamada de elementos num grupo: " + error);
        });
})

router.get('/:id/dominio', function (req, res) {
    Orgs.domain(req.params.id)
        .then(org => res.send(org))
        .catch(function (error) {
            console.error("Chamada de dominio: " + error);
        });
})

router.get('/:id/participacoes', function (req, res) {
    Orgs.participations(req.params.id)
        .then(org => res.send(org))
        .catch(function (error) {
            console.error("Chamada de participações: " + error);
        });
})

router.post('/', Auth.isLoggedInAPI, function (req, res) {
    var initials = req.body.initials;
    var name = req.body.name;
    var type = req.body.type;
    var id;

    switch (type) {
        case 'Organizacao': id = 'org_' + initials;
            break;
        case 'ConjuntoOrganizacoes': id = 'conj_org_' + initials;
            break;
        case 'TipologiaOrganizacao': id = 'tipol_org_' + initials;
            break;
        default: id = 'error';
            break;
    }

    Orgs.checkAvailability(name, initials)
        .then(function (count) {
            if (count > 0) {
                res.send("Nome e/ou Sigla já existente(s)!");
            }
            else {
                Orgs.createOrg(id, name, initials, type)
                    .then(function () {
                        Logging.logger.info('Criada organização \'' + id + '\' por utilizador \'' + req.user._id + '\'');

                        req.flash('success_msg', 'Organização adicionada');
                        res.send(id);
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error("General error:\n" + error));
})

router.put('/:id', Auth.isLoggedInAPI, function (req, res) {
    var dataObj = req.body;

    //Executing queries
    Orgs.checkAvailability(dataObj.name)
        .then(function (count) {
            if (count > 0) {
                res.send("Nome já existentente!");
            }
            else {
                Orgs.updateOrg(dataObj)
                    .then(function () {
                        Logging.logger.info('Update a organização \'' + req.params.id + '\' por utilizador \'' + req.user._id + '\'');

                        req.flash('success_msg', 'Info. de Organização actualizada');
                        res.send(dataObj.id);
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error("Initials error:\n" + error));

})

router.delete('/:id', Auth.isLoggedInAPI, function (req, res) {
    Orgs.deleteOrg(req.params.id)
        .then(function () {
            Logging.logger.info('Apagada organização \'' + req.params.id + '\' por utilizador \'' + req.user._id + '\'');

            req.flash('success_msg', 'Entrada apagada');
            res.send("Entrada apagada!");
        })
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;
var Logging = require('../logging');
var Auth = require('../auth');

module.exports = function (app) {

    //  Ontology endpoint
    const { SparqlClient, SPARQL } = require('sparql-client-2');

    const client = new SparqlClient('http://epl.di.uminho.pt:40003/repositories/M51-CLAV', {
        updateEndpoint: 'http://epl.di.uminho.pt:40003/repositories/M51-CLAV/statements'
    }).register({
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        clav: 'http://jcr.di.uminho.pt/m51-clav#',
        owl: 'http://www.w3.org/2002/07/owl#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        noInferences: 'http://www.ontotext.com/explicit'
    });
    //

    app.get('/orgs', function (req, res) {

        function fetchOrgs() {
            return client.query(
                `SELECT * {
                    {
                        SELECT ?id ?Nome ?Sigla where {
                            ?id rdf:type clav:Organizacao .
                        }
                    } UNION {
                        SELECT ?id ?Nome ?Sigla where {
                            ?id rdf:type clav:TipologiaOrganizacao .
                        }
                    } UNION {
                        SELECT ?id ?Nome ?Sigla where {
                            ?id rdf:type clav:ConjuntoOrganizacoes .
                        }
                    }
                    ?id rdf:type ?Tipo ;
                        clav:orgNome ?Nome ;
                        clav:orgSigla ?Sigla
					filter(?Tipo!=owl:NamedIndividual)
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Listagem: " + error);
                });
        }

        fetchOrgs()
            .then(orgs => res.send(orgs))
            .catch(function (error) {
                console.error("Chamada a Listagem: " + error);
            });
    })

    app.get('/inConjs', function (req, res) {
        var url = require('url');

        function fetchList(id) {
            return client.query(
                `SELECT * FROM noInferences: WHERE {
                    clav:${id} clav:pertenceConjOrg ?id .
                    ?id rdf:type ?Tipo ;
                        clav:orgNome ?Nome ;
                        clav:orgSigla ?Sigla .
					filter(?Tipo!=owl:NamedIndividual)
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Conjuntos a que x pertence: " + error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        fetchList(id)
            .then(list => res.send(list))
            .catch(function (error) {
                console.error("Chamada de conjuntos a que x pertence: " + error);
            });
    })

    app.get('/inTipols', function (req, res) {
        var url = require('url');

        function fetchList(id) {
            var fetchQuery = `
            SELECT * FROM noInferences: WHERE {
                clav:${id} clav:pertenceTipologiaOrg ?id .
                ?id rdf:type ?Tipo ;
                    clav:orgNome ?Nome ;
                    clav:orgSigla ?Sigla .
                    
                filter(?Tipo!=owl:NamedIndividual)
            }`;

            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Tipologias a que x pertence: " + error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        fetchList(id)
            .then(list => res.send(list))
            .catch(function (error) {
                console.error("Chamada de tipologias a que x pertence: " + error);
            });
    })

    app.get('/orgsInGroup', function (req, res) {
        var url = require('url');

        function fetchList(id) {
            return client.query(
                `SELECT * WHERE {
                    clav:${id} clav:temOrg ?id .
                    ?id rdf:type ?Tipo ;
                        clav:orgNome ?Nome ;
                        clav:orgSigla ?Sigla .
                    filter(?Tipo!=owl:NamedIndividual)
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Elementos num grupo: " + error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        fetchList(id)
            .then(list => res.send(list))
            .catch(function (error) {
                console.error("Chamada de elementos num grupo: " + error);
            });
    })

    app.get('/singleOrg', function (req, res) {
        var url = require('url');

        function fetchOrg(id) {
            return client.query(`
                SELECT ?Nome ?Sigla ?Tipo where {
                    clav:${id} clav:orgNome ?Nome ;
                        rdf:type ?Tipo ;
                        clav:orgSigla ?Sigla .
					filter(?Tipo!=owl:NamedIndividual)
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Dados de uma org: " + error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchOrg(id).then(org => res.send(org))
            .catch(function (error) {
                console.error("Chamada de dados de uma org: " + error);
            });
    })

    app.get('/domainOrg', function (req, res) {
        var url = require('url');

        function fetchDomain(id) {
            var fetchQuery = `
                SELECT * WHERE {
                    ?id clav:temDono clav:${id} ;
                        clav:codigo ?Code ;
                        clav:titulo ?Title .
                }`
                ;

            return client.query(fetchQuery)
                .execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Dominio de org: " + error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchDomain(id).then(org => res.send(org))
            .catch(function (error) {
                console.error("Chamada de dominio: " + error);
            });
    })

    app.get('/partsOrg', function (req, res) {
        var url = require('url');

        function fetchParts(id) {
            var fetchQuery = `
                select * where { 
                    ?id clav:temParticipante clav:${id} ;
                        ?Type clav:${id} ;
                    
                        clav:titulo ?Title ;
                        clav:codigo ?Code .
                    
                    filter (?Type!=clav:temParticipante && ?Type!=clav:temDono)
                }`
                ;

            return client.query(fetchQuery)
                .execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Participações de org: " + error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchParts(id).then(org => res.send(org))
            .catch(function (error) {
                console.error("Chamada de participações: " + error);
            });
    })

    app.post('/createOrg', Auth.isLoggedInAPI, function (req, res) {
        //Check if organization Name or Initials already exist
        function checkOrg(name, initials) {
            var checkQuery = `
                SELECT (count(*) as ?Count) where { 
                    ?o clav:orgSigla ?s ;
                        clav:orgNome ?n .
                    filter (?s='${initials}' || ?n='${name}').
                }
            `;

            return client.query(checkQuery).execute()
                //Getting the content we want
                .then(response => Promise.resolve(response.results.bindings[0].Count.value))
                .catch(function (error) {
                    console.error("Error in check:\n" + error);
                });
        }

        //Create new organization
        function createOrg(id, name, initials, type) {
            var createQuery = `
                INSERT DATA {
                    clav:${id} rdf:type owl:NamedIndividual ,
                            clav:${type} ;
                        clav:orgNome '${name}' ;
                        clav:orgSigla '${initials}'
                }
            `;

            return client.query(createQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in create:\n" + error));
        }

        //Getting data to insert
        var parts = req.body;
        var initials = parts.initials;
        var name = parts.name;
        var type = parts.type;
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

        //Executing queries
        checkOrg(name, initials)
            .then(function (count) {
                if (count > 0) {
                    res.send("Nome e/ou Sigla já existente(s)!");
                }
                else {
                    createOrg(id, name, initials, type)
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

    app.put('/updateOrg', Auth.isLoggedInAPI, function (req, res) {
        //Check if organization Name or Initials already exist
        function checkOrg(name) {
            var checkQuery = ` 
                SELECT (count(*) as ?Count) where { 
                    ?o clav:orgNome '${name}' .
                }
            `;

            return client.query(checkQuery).execute()
                //Getting the content we want
                .then(response => Promise.resolve(response.results.bindings[0].Count.value))
                .catch(function (error) {
                    console.error("Error in check:\n" + error);
                });
        }

        //Update organization
        function updateOrg(dataObj) {

            function prepDelete(dataObj) {
                var ret = "";

                if (dataObj.domain.del && dataObj.domain.del.length) {
                    for (let process of dataObj.domain.del) {
                        ret += `\tclav:${process.id} clav:temDono clav:${dataObj.id} .\n`;
                    }
                }

                for (const pType in dataObj.parts) {
                    if (dataObj.parts[pType].del && dataObj.parts[pType].del.length) {
                        for (let p of dataObj.parts[pType].del) {
                            ret += "\tclav:" + p.id + " clav:temParticipante" + pType + " clav:" + dataObj.id + " .\n";
                        }
                    }
                }

                if (dataObj.conjs.del && dataObj.conjs.del.length) {
                    for (let conj of dataObj.conjs.del) {
                        ret += `\tclav:${dataObj.id} clav:pertenceConjOrg clav:${conj.id} .\n`;
                    }
                }

                if (dataObj.tipols.del && dataObj.tipols.del.length) {
                    for (let tipol of dataObj.tipols.del) {
                        ret += `\tclav:${dataObj.id} clav:pertenceTipologiaOrg clav:${tipol.id} .\n`;
                    }
                }

                if (dataObj.elems.del && dataObj.elems.del.length) {
                    for (let org of dataObj.elems.del) {
                        if (dataObj.type == "Conjunto") {
                            ret += `\tclav:${org.id} clav:pertenceConjOrg clav:${dataObj.id} .\n`;
                        }
                        else {
                            ret += `\tclav:${org.id} clav:pertenceTipologiaOrg clav:${dataObj.id} .\n`;
                        }
                    }
                }

                return ret;
            }

            function prepInsert(dataObj) {
                var ret = "";

                if (dataObj.initials) {
                    ret += `\tclav:${dataObj.id} clav:orgSigla '${dataObj.initials}' .\n`;
                }

                if (dataObj.name) {
                    ret += `\tclav:${dataObj.id} clav:orgNome '${dataObj.name}' .\n`;
                }

                if (dataObj.domain.add && dataObj.domain.add.length) {
                    for (let process of dataObj.domain.add) {
                        ret += `\tclav:${process.id} clav:temDono clav:${dataObj.id} .\n`;
                    }
                }

                for (const pType in dataObj.parts) {
                    if (dataObj.parts[pType].add && dataObj.parts[pType].add.length) {
                        for (let p of dataObj.parts[pType].add) {
                            ret += "\tclav:" + p.id + " clav:temParticipante" + pType + " clav:" + dataObj.id + " .\n";
                        }
                    }
                }

                if (dataObj.conjs.add && dataObj.conjs.add.length) {
                    for (let conj of dataObj.conjs.add) {
                        ret += `\tclav:${dataObj.id} clav:pertenceConjOrg clav:${conj.id} .\n`;
                    }
                }

                if (dataObj.tipols.add && dataObj.tipols.add.length) {
                    for (let tipol of dataObj.tipols.add) {
                        ret += `\tclav:${dataObj.id} clav:pertenceTipologiaOrg clav:${tipol.id} .\n`;
                    }
                }

                if (dataObj.elems.add && dataObj.elems.add.length) {
                    for (let org of dataObj.elems.add) {
                        if (dataObj.type == "Conjunto") {
                            ret += `\tclav:${org.id} clav:pertenceConjOrg clav:${dataObj.id} .\n`;
                        }
                        else if (dataObj.type == "Tipologia") {
                            ret += `\tclav:${org.id} clav:pertenceTipologiaOrg clav:${dataObj.id} .\n`;
                        }
                    }
                }

                return ret;
            }

            function prepWhere(dataObj) {
                var ret = "";

                if (dataObj.initials) {
                    ret += `\tclav:${dataObj.id} clav:orgSigla ?s .\n`;
                }

                if (dataObj.name) {
                    ret += `\tclav:${dataObj.id} clav:orgNome ?n .\n`;
                }

                return ret;
            }

            var deletePart = "DELETE {\n" + prepWhere(dataObj) + prepDelete(dataObj) + "}\n";
            var inserTPart = "INSERT {\n" + prepInsert(dataObj) + "}\n";
            var wherePart = "WHERE {\n" + prepWhere(dataObj) + "}\n";

            var updateQuery = deletePart + inserTPart + wherePart;

            return client.query(updateQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in update:\n" + error));
        }

        //Getting data
        var dataObj = req.body;
        
        //Executing queries
        checkOrg(dataObj.name)
            .then(function (count) {
                if (count > 0) {
                    res.send("Nome já existentente!");
                }
                else {
                    updateOrg(dataObj)
                        .then(function () {
                            Logging.logger.info('Update a organização \'' + dataObj.id + '\' por utilizador \'' + req.user._id + '\'');

                            req.flash('success_msg', 'Info. de Organização actualizada');
                            res.send(dataObj.id);
                        })
                        .catch(error => console.error(error));
                }
            })
            .catch(error => console.error("Initials error:\n" + error));

    })

    app.post('/deleteOrg', Auth.isLoggedInAPI, function (req, res) {

        function deleteOrg(id) {
            var deleteQuery = `
                DELETE {
                    clav:${id} ?o ?p .
                    ?s ?o clav:${id}
                }
                WHERE { ?s ?o ?p }
            `;

            return client.query(deleteQuery).execute()
                //getting the content we want
                .then(response => Promise.resolve(response))
                .catch(function (error) {
                    console.error(error);
                });
        }

        //Getting data
        var id = req.body.id;

        //Answer the request
        deleteOrg(id)
            .then(function () {
                Logging.logger.info('Apagada organização \'' + id + '\' por utilizador \'' + req.user._id + '\'');

                req.flash('success_msg', 'Entrada apagada');
                res.send("Entrada apagada!");
            })
            .catch(function (error) {
                console.error(error);
            });
    })
}
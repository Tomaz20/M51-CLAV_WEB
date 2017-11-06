module.exports = function (app) {

//  Ontology endpoint
    const { SparqlClient, SPARQL } = require('sparql-client-2');

    const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV', {
        updateEndpoint: 'http://localhost:7200/repositories/M51-CLAV/statements'
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
                `SELECT ?id ?Nome ?Sigla where {
                    ?id rdf:type clav:Organizacao ;
                        clav:orgNome ?Nome ;
                        clav:orgSigla ?Sigla
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        fetchOrgs()
            .then(orgs => res.send(orgs))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.get('/singleOrg', function (req, res) {
        var url = require('url');

        function fetchOrg(id) {
            return client.query(`
                SELECT ?Nome ?Sigla where {
                    clav:${id} clav:orgNome ?Nome ;
                        clav:orgSigla ?Sigla
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchOrg(id).then(org => res.send(org))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.get('/domainOrg', function (req, res) {
        var url = require('url');

        function fetchDomain(id) {
            var fetchQuery= `
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
                    console.error(error);
            });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchDomain(id).then(org => res.send(org))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.get('/partsOrg', function (req, res) {
        var url = require('url');

        function fetchParts(id) {
            var fetchQuery= `
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
                    console.error(error);
            });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchParts(id).then(org => res.send(org))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.post('/createOrg', function (req, res) {
        //Check if organization Name or Initials already exist
        function checkOrg(name, initials) {
            var checkQuery = `
                SELECT (count(*) as ?Count) where { 
                    ?o rdf:type clav:Organizacao ;
                        clav:orgSigla ?s ;
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
        function createOrg(id, name, initials) {
            var createQuery = `
                INSERT DATA {
                    clav:${id} rdf:type owl:NamedIndividual ,
                            clav:Organizacao ;
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
        var id = "org_" + initials;

        //Executing queries
        checkOrg(name, initials)
            .then(function (count) {
                if (count > 0) {
                    res.send("Nome e/ou Sigla já existente(s)!");
                }
                else {
                    createOrg(id, name, initials)
                        .then(function () {
                            res.send("Inserido!");
                        })
                        .catch(error => console.error(error));
                }
            })
            .catch(error => console.error("General error:\n" + error));
    })

    app.put('/updateOrg', function (req, res) {
        //Check if organization Name or Initials already exist
        function checkOrg(name, initials) {
            var checkQuery = ` 
                SELECT (count(*) as ?Count) where { 
                    ?o rdf:type clav:Organizacao ;
                        clav:orgSigla ?s ;
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

        //Update organization
        function updateOrg(id, name, initials) {
            if (name && !initials) {
                var updateQuery = `
                    DELETE {clav:${id} clav:orgNome ?o }
                    INSERT {clav:${id} clav:orgNome '${name}' }
                    WHERE  {clav:${id} ?p ?o }
                `;
            }
            else if (!name && initials) {
                var newID = "org_" + initials;

                var updateQuery = `
                    DELETE {clav:${id} ?p ?o }
                    INSERT {
                        clav:${newID} rdf:type clav:Organizacao ;
                            clav:orgNome ?nome ;
                            clav:orgSigla '${initials}'
                    }
                    WHERE  {clav:${id} clav:orgNome ?nome };
                    DELETE {clav:${id} ?p ?o }
                    WHERE {?s ?p ?o}
                `;
            }
            else {
                var newID = "org_" + initials;

                var updateQuery = `
                    DELETE {clav:${id} ?p ?o }
                    INSERT {
                        clav:${newID} rdf:type clav:Organizacao ;
                            clav:orgNome '${name}' ;
                            clav:orgSigla '${initials}'
                    }
                    WHERE  {clav:${id} ?p ?o };
                    DELETE {clav:${id} ?p ?o }
                    WHERE {?s ?p ?o}
                `;
            }
            
            return client.query(updateQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in update:\n" + error));
        }
        
        //Getting data
        var dataObj = req.body;
        
        var initials = dataObj.initials;
        var name = dataObj.name;
        var id = dataObj.id;

        //Executing queries
        checkOrg(name, initials)
            .then(function (count) {
                if (count > 0) {
                    res.send("Nome e/ou Sigla já existentente(s)!");
                }
                else {
                    updateOrg(id, name, initials)
                        .then(function () {
                            res.send("Actualizado!");
                        })
                        .catch(error => console.error(error));
                }
            })
            .catch(error => console.error("Initials error:\n" + error));
        
    })

    app.post('/deleteOrg', function (req, res) {
        
        function deleteOrg(id) {
            var deleteQuery = `
                DELETE {
                    clav:${id} ?o ?p
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
            .then(function() {
                res.send("Entrada apagada!");
            })
            .catch(function (error) {
                console.error(error);
        });
    })
}
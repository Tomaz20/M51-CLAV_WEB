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

    app.get('/legs', function (req, res) {

        function fetchLegs() {
            return client.query(
                `SELECT * WHERE { 
                    ?id rdf:type clav:Legislacao;
                        clav:diplomaAno ?Ano;
                        clav:diplomaData ?Data;
                        clav:diplomaNumero ?Número;
                        clav:diplomaTipo ?Tipo;
                        clav:diplomaTitulo ?Titulo
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        fetchLegs()
            .then(legs => res.send(legs))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.get('/singleLeg', function (req, res) {
        var url = require('url');

        function fetchLeg(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                        clav:`+ id + ` clav:diplomaAno ?Ano;
                        clav:diplomaData ?Data;
                        clav:diplomaNumero ?Número;
                        clav:diplomaTipo ?Tipo;
                        clav:diplomaTitulo ?Titulo;
                        clav:diplomaLink ?Link;
                }`;

            return client.query(fetchQuery)
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
        fetchLeg(id).then(leg => res.send(leg))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get processes regulated by a legislation
    app.get('/procsLeg', function (req, res) {
        var url = require('url');

        function fetchList(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    ?id clav:temLegislacao clav:`+ id + `;
                        clav:codigo ?Code;
                        clav:titulo ?Title;
                }`;

            console.log(fetchQuery);

            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchList(id).then(legs => res.send(legs))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.post('/createLeg', function (req, res) {
        //generate a new ID
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

        //Check if legislation number already exists
        function checkNumber(number) {
            var checkQuery = `
                SELECT (count(*) AS ?Count) WHERE {
                    ?leg rdf:type clav:Legislacao ;
                        clav:diplomaNumero '${number}'
                }
            `;

            return client.query(checkQuery).execute()
                //Getting the content we want
                .then(response => Promise.resolve(response.results.bindings[0].Count.value))
                .catch(function (error) {
                    console.error("Error in check:\n" + error);
                });
        }

        //Get the list of IDs
        function fetchList() {
            var fetchList = SPARQL`
                SELECT *
                WHERE {
                    ?id rdf:type clav:Legislacao .
                }
            `;

            return client.query(fetchList).execute()
                //Getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error("Error in check:\n" + error);
                });
        }

        //Create new organization
        function createLeg(newID, year, date, number, type, title, link) {
            var createQuery = SPARQL`
                INSERT DATA {
                    ${{ clav: newID }} rdf:type owl:NamedIndividual ,
                            clav:Legislacao ;
                        clav:diplomaAno ${year} ;
                        clav:diplomaData ${date} ;
                        clav:diplomaNumero ${number} ;
                        clav:diplomaTipo ${type} ;
                        clav:diplomaTitulo ${title} ;
                        clav:diplomaLink ${link} .
                }
            `;

            console.log(createQuery);

            return client.query(createQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in create:\n" + error));
        }

        //Parsing body to get parameters
        var parts = req.body;
        var year = parts.year;
        var date = parts.date;
        var number = parts.number;
        var type = parts.type;
        var title = parts.title;
        var link = parts.link;


        //Executing queries
        checkNumber(number)
            .then(function (count) {
                if (count > 0) {
                    res.send("Número já existente!");
                }
                else {

                    fetchList()
                        .then(function (ids) {
                            var newID = genID(ids)

                            createLeg(newID, year, date, number, type, title, link)
                                .then(function () {
                                    res.send("Inserido!");
                                })
                                .catch(error => console.error(error));

                        })
                        .catch(error => console.error("newID error: \n\t" + error))
                }
            })
            .catch(error => console.error("General error:\n" + error));
    })

    app.put('/updateleg', function (req, res) {
        var url = require('url');

        //Check if legislation Initials already exists
        function checkNumber(number) {
            var checkQuery = `
                SELECT (count(*) AS ?Count) WHERE {
                    ?org rdf:type clav:Legislacao ;
                        clav:diplomaNumero '${number}'
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
        function updateLeg(id, year, date, number, type, title, link) {
            var del = "";
            var ins = "";
            var wer = "";

            if (year) {
                del += `clav:` + id + ` clav:diplomaAno ?y .\n`;
                ins += `clav:` + id + ` clav:diplomaAno "` + year + `" .\n`;
            }
            if (date) {
                del += `clav:` + id + ` clav:diplomaData ?d .\n`;
                ins += `clav:` + id + ` clav:diplomaData "` + date + `" .\n`;
            }
            if (number) {
                del += `clav:` + id + ` clav:diplomaNumero ?n .\n`;
                ins += `clav:` + id + ` clav:diplomaNumero "` + number + `" .\n`;
            }
            if (type) {
                del += `clav:` + id + ` clav:diplomaTipo ?t .\n`;
                ins += `clav:` + id + ` clav:diplomaTipo "` + type + `" .\n`;
            }
            if (title) {
                del += `clav:` + id + ` clav:diplomaTitulo ?tit .\n`;
                ins += `clav:` + id + ` clav:diplomaTitulo "` + title + `" .\n`;
            }
            if (link) {
                del += `clav:` + id + ` clav:diplomaLink ?l .\n`;
                ins += `clav:` + id + ` clav:diplomaLink "` + link + `" .\n`;
            }

            wer = "WHERE {" + del + "}\n";
            del = "DELETE {" + del + "}\n";
            ins = "INSERT {" + ins + "}\n";

            var updateQuery = del + ins + wer;

            console.log(updateQuery);

            return client.query(updateQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in update:\n" + error));
        }

        //Parsing body to get parameters
        var parts = req.body;
        var id = parts.id;
        var year = parts.year;
        var date = parts.date;
        var number = parts.number;
        var type = parts.type;
        var title = parts.title;
        var link = parts.link;

        //Executing queries
        if (number) {
            checkNumber(number)
                .then(function (count) {
                    if (count > 0) {
                        res.send("Número já existente!");
                    }
                    else {
                        updateLeg(id, year, date, number, type, title, link)
                            .then(function () {
                                res.send("Actualizado!");
                            })
                            .catch(error => console.error(error));
                    }
                })
                .catch(error => console.error("Check error:\n" + error));
        }
        else {
            updateLeg(id, year, date, number, type, title, link)
                .then(function () {
                    res.send("Actualizado!");
                })
                .catch(error => console.error(error));
        }
    })

    app.post('/deleteLeg', function (req, res) {
        
        function deleteLeg(id) {
            return client.query(SPARQL`
                    DELETE {
                        ${{ clav: id }} ?o ?p
                    }
                    WHERE { ?s ?o ?p }
                `).execute()
                //getting the content we want
                .then(response => Promise.resolve(response))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var id = req.body.id;

        //Answer the request
        deleteLeg(id)
            .then(function () {
                res.send("Entrada apagada!");
            })
            .catch(function (error) {
                console.error(error);
            });
    })
}
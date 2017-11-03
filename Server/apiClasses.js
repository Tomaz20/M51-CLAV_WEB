module.exports = function (app) {

    //get a list of classes from a given level N (default N=1)
    app.get('/classesn', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                noInferences: 'http://www.ontotext.com/explicit'
            }
            );

        function fetchClasses(level,table) {
            if (!level) {
                level = 1;
            }

            var listQuery = `
                SELECT ?id ?Code ?Title (count(?sub) as ?NChilds) FROM noInferences:
                WHERE {
                    ?id rdf:type clav:Classe_N`+ level + ` ;
                        clav:codigo ?Code ;
                        clav:titulo ?Title .
            `;
            
            if(table){
                listQuery+=`?id clav:pertenceTS clav:`+table+` .`
            }

            listQuery+=`
                    optional {
                        ?sub clav:temPai ?id .
            `;

            if(table){
                listQuery+=`?sub clav:pertenceTS clav:`+table+` .`
            }

            listQuery+=`
                    }
                }Group by ?id ?Code ?Title
            `;
            
            
            return client.query(listQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                }
            );
        }

        var parts = url.parse(req.url, true);
        var level = parts.query.level;
        var table = parts.query.table;

        fetchClasses(level,table)
            .then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            }
        );
    })

    //get the list of child classes of a given class (opt.: filter by TS)
    app.get('/childClasses', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                noInferences: 'http://www.ontotext.com/explicit'
            });

        function fetchChilds(parent,table) {
            var fetchQuery = `
                SELECT ?Child ?Code ?Title (count(?sub) as ?NChilds)
                WHERE {
                    ?Child clav:temPai clav:`+ parent + ` ;
                           clav:codigo ?Code ;
                           clav:titulo ?Title .
            `;
            if(table){
                                fetchQuery+=`?Child clav:pertenceTS clav:`+table+` .`
            }

            fetchQuery+=`
                optional {
                    ?sub clav:temPai ?Child .
            `;

            if(table){
                fetchQuery+=`?sub clav:pertenceTS clav:`+table+` .`
            }

            fetchQuery+=`
                }
            }Group by ?Child ?Code ?Title
            `;

                        
            return client.query(fetchQuery)
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var parent = parts.query.parent;
        var table = parts.query.table;

                
        //Answer the request
        fetchChilds(parent,table).then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get data on a single class
    app.get('/singleClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchClass(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    clav:`+ id + ` clav:titulo ?Titulo;
                        clav:codigo ?Codigo;
                    OPTIONAL {
                        clav:`+ id + ` clav:temPai ?Pai.
                        ?Pai clav:codigo ?CodigoPai;
                            clav:titulo ?TituloPai.
                    } OPTIONAL {
                        clav:`+ id + ` clav:classeStatus ?Status.
                    } OPTIONAL {
                        clav:`+ id + ` clav:descricao ?Desc.
                    } OPTIONAL {
                        clav:`+ id + ` clav:processoTipo ?ProcTipo.
                    } OPTIONAL {
                        clav:`+ id + ` clav:processoTransversal ?ProcTrans.
                    }
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
        fetchClass(id).then(clas => res.send(clas))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of class Owners
    app.get('/ownersClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchOwners(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    clav:`+ id + ` clav:temDono ?id.
                    ?id clav:orgNome ?Nome;
                        clav:orgSigla ?Sigla;
                }`;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchOwners(id).then(owners => res.send(owners))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of legislations associated with a class
    app.get('/legsClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchLegs(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    clav:`+ id + ` clav:temLegislacao ?id.
                    ?id clav:diplomaNumero ?Número;
                        clav:diplomaTitulo ?Titulo;
                        clav:diplomaTipo ?Tipo;
                }`;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchLegs(id).then(legs => res.send(legs))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of a class' example(s) of application notes
    app.get('/exAppNotesClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchExamples(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    clav:`+ id + ` clav:exemploNA ?Exemplo.
                }`;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchExamples(id).then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of a class' application notes
    app.get('/appNotesClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchAppNotes(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    clav:`+ id + ` clav:temNotaAplicacao ?id.
                    ?id clav:conteudo ?Nota .
                }`;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchAppNotes(id).then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of a class' deletion notes
    app.get('/delNotesClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchDelNotes(id) {
            var fetchQuery = `
                SELECT * WHERE { 
                    clav:`+ id + ` clav:temNotaExclusao ?id.
                    ?id clav:conteudo ?Nota .
                }`;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchDelNotes(id).then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of a classes related to a given class
    app.get('/relProcsClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchRelProc(id) {
            var fetchQuery = `
                select DISTINCT ?id ?Code ?Title {
                    {
                        select * where{
                            clav:`+ id + ` clav:temRelProc ?id.
                        }
                    } union {
                        select * where{
                            ?id clav:temRelProc clav:`+ id + `.
                        } 
                    }
                    ?id clav:codigo ?Code;
                            clav:titulo ?Title
                }
            `;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchRelProc(id).then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    //get list of participants in a class
    app.get('/participantsClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetchParticipant(id) {
            var fetchQuery = `
                select * where { 
                    clav:`+ id + ` clav:temParticipante ?id ;
                        ?Type ?id .
                    
                    ?id clav:orgNome ?Nome ;
                        clav:orgSigla ?Sigla .
                    
                    filter (?Type!=clav:temParticipante && ?Type!=clav:temDono)
                }
            `;

            
<<<<<<< HEAD

=======
>>>>>>> master
            return client.query(fetchQuery).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var parts = url.parse(req.url, true);
        var id = parts.query.id;

        //Answer the request
        fetchParticipant(id).then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    //updates a class's info
    app.put('/updateClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV', {
            updateEndpoint: 'http://localhost:7200/repositories/M51-CLAV/statements'
        })
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function prepDelete(dataObj) {
            var deletePart = "\n";

            //relations
            if (dataObj.Owners.Delete && dataObj.Owners.Delete.length) {
                for (var i = 0; i < dataObj.Owners.Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temDono clav:" + dataObj.Owners.Delete[i].id + " .\n";
                }
            }
            if (dataObj.Legs.Delete && dataObj.Legs.Delete.length) {
                for (var i = 0; i < dataObj.Legs.Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temLegislacao clav:" + dataObj.Legs.Delete[i].id + " .\n";
                }
            }
            if (dataObj.Legs.Delete && dataObj.Legs.Delete.length) {
                for (var i = 0; i < dataObj.Legs.Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temLegislacao clav:" + dataObj.Legs.Delete[i].id + " .\n";
                }
            }
            if (dataObj.AppNotes.Delete && dataObj.AppNotes.Delete.length) {
                for (var i = 0; i < dataObj.AppNotes.Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temNotaAplicacao clav:" + dataObj.AppNotes.Delete[i].id + " .\n";
                }
            }
            if (dataObj.DelNotes.Delete && dataObj.DelNotes.Delete.length) {
                for (var i = 0; i < dataObj.DelNotes.Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temNotaExclusao clav:" + dataObj.DelNotes.Delete[i].id + " .\n";
                }
            }
            if (dataObj.RelProcs.Delete && dataObj.RelProcs.Delete.length) {
                for (var i = 0; i < dataObj.RelProcs.Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temRelProc clav:" + dataObj.RelProcs.Delete[i].id + " .\n";
                    deletePart += "\tclav:" + dataObj.RelProcs.Delete[i].id + " clav:temRelProc clav:" + dataObj.id + " .\n";
                }
            }

            var partKeys = Object.keys(dataObj.Participants);

            for (var k = 0; k < partKeys.length; k++) {
                if (dataObj.Participants[partKeys[k]].Delete && dataObj.Participants[partKeys[k]].Delete.length) {
                    for (var i = 0; i < dataObj.Participants[partKeys[k]].Delete.length; i++) {
                        deletePart += "\tclav:" + dataObj.id + " clav:temParticipante"+partKeys[k]+" clav:" + dataObj.Participants[partKeys[k]].Delete[i].id + " .\n";
                    }
                }
            }

            return deletePart;
        }

        function prepWhere(dataObj) {
            var wherePart = "\n";

            //atributes
            if (dataObj.Title) {
                wherePart += "\tclav:" + dataObj.id + " clav:titulo ?tit .\n";
            }
            if (dataObj.Status) {
                wherePart += "\tclav:" + dataObj.id + " clav:classeStatus ?status .\n";
            }
            if (dataObj.Desc) {
                wherePart += "\tclav:" + dataObj.id + " clav:descricao ?desc .\n";
            }
            if (dataObj.ProcType) {
                wherePart += "\tclav:" + dataObj.id + " clav:processoTipo ?ptipo .\n";
            }
            if (dataObj.ProcTrans) {
                wherePart += "\tclav:" + dataObj.id + " clav:processoTransversal ?ptrans .\n";
            }
            if (dataObj.ExAppNotes && dataObj.ExAppNotes.length) {
                wherePart += "\tclav:" + dataObj.id + " clav:exemploNA ?exNA .\n";
            }

            //relations
            if (dataObj.AppNotes.Delete && dataObj.AppNotes.Delete.length) {
                for (var i = 0; i < dataObj.AppNotes.Delete.length; i++) {
                    wherePart += "\tclav:" + dataObj.AppNotes.Delete[i].id + " ?NAp"+i+" ?NAo"+i+" .\n";
                }
            }
            if (dataObj.DelNotes.Delete && dataObj.DelNotes.Delete.length) {
                for (var i = 0; i < dataObj.DelNotes.Delete.length; i++) {
                    wherePart += "\tclav:" + dataObj.DelNotes.Delete[i].id + " ?NEp"+i+" ?NEo"+i+" .\n";
                }
            }

            return wherePart;
        }

        function prepInsert(dataObj) {
            var insertPart = "\n";

            //attributes
            if (dataObj.Title) {
                insertPart += "\tclav:" + dataObj.id + " clav:titulo '" + dataObj.Title + "' .\n";
            }
            if (dataObj.Status) {
                insertPart += "\tclav:" + dataObj.id + " clav:classeStatus '" + dataObj.Status + "' .\n";
            }
            if (dataObj.Desc) {
                insertPart += "\tclav:" + dataObj.id + " clav:descricao '" + dataObj.Desc.replace(/\n/g, '\\n') + "' .\n";
            }
            if (dataObj.ProcType) {
                insertPart += "\tclav:" + dataObj.id + " clav:processoTipo '" + dataObj.ProcType + "' .\n";
            }
            if (dataObj.ProcTrans) {
                insertPart += "\tclav:" + dataObj.id + " clav:processoTransversal '" + dataObj.ProcTrans + "' .\n";
            }
            if (dataObj.ExAppNotes && dataObj.ExAppNotes.length) {
                for (var i = 0; i < dataObj.ExAppNotes.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:exemploNA '" + dataObj.ExAppNotes[i].Exemplo.replace(/\n/g, '\\n') + "' .\n";
                }
            }

            //relations
            //Notas de aplicação
            if (dataObj.AppNotes.Add && dataObj.AppNotes.Add.length) {
                for (var i = 0; i < dataObj.AppNotes.Add.length; i++) {
                    insertPart += `
                        clav:`+ dataObj.AppNotes.Add[i].id + ` rdf:type owl:NamedIndividual ,
                                clav:NotaAplicacao ;
                            clav:conteudo "`+ dataObj.AppNotes.Add[i].Nota.replace(/\n/g, '\\n') + `" .
                    `;
                    insertPart += "\tclav:" + dataObj.id + " clav:temNotaAplicacao clav:" + dataObj.AppNotes.Add[i].id + " .\n";
                }
            }
            //Notas de exclusão
            if (dataObj.DelNotes.Add && dataObj.DelNotes.Add.length) {
                for (var i = 0; i < dataObj.DelNotes.Add.length; i++) {
                    insertPart += `
                        clav:`+ dataObj.DelNotes.Add[i].id + ` rdf:type owl:NamedIndividual ,
                                clav:NotaExclusao ;
                            clav:conteudo "`+ dataObj.DelNotes.Add[i].Nota.replace(/\n/g, '\\n') + `" .
                    `;
                    insertPart += "\tclav:" + dataObj.id + " clav:temNotaExclusao clav:" + dataObj.DelNotes.Add[i].id + " .\n";
                }
            }
            //Donos
            if (dataObj.Owners.Add && dataObj.Owners.Add.length) {
                for (var i = 0; i < dataObj.Owners.Add.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:temDono clav:" + dataObj.Owners.Add[i].id + " .\n";
                }
            }
            //Legislações
            if (dataObj.Legs.Add && dataObj.Legs.Add.length) {
                for (var i = 0; i < dataObj.Legs.Add.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:temLegislacao clav:" + dataObj.Legs.Add[i].id + " .\n";
                }
            }
            //Relações com Processos 
            if (dataObj.RelProcs.Add && dataObj.RelProcs.Add.length) {
                for (var i = 0; i < dataObj.RelProcs.Add.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:temRelProc clav:" + dataObj.RelProcs.Add[i].id + " .\n";
                    insertPart += "\tclav:" + dataObj.RelProcs.Add[i].id + " clav:temRelProc clav:" + dataObj.id + " .\n";
                }
            }
            //Participantes
            var partKeys = Object.keys(dataObj.Participants);

            for (var k = 0; k < partKeys.length; k++) {
                if (dataObj.Participants[partKeys[k]].Add && dataObj.Participants[partKeys[k]].Add.length) {
                    for (var i = 0; i < dataObj.Participants[partKeys[k]].Add.length; i++) {
                        insertPart += "\tclav:" + dataObj.id + " clav:temParticipante" + partKeys[k] + " clav:" + dataObj.Participants[partKeys[k]].Add[i].id + " .\n";
                    }
                }
            }

            return insertPart;
        }

        //Update organization
        function updateClass(dataObj) {
            var deletePart = "DELETE {" + prepWhere(dataObj) + prepDelete(dataObj) + "}\n";
            var inserTPart = "INSERT {" + prepInsert(dataObj) + "}\n";
            var wherePart = "WHERE {" + prepWhere(dataObj) + "}\n";

            updateQuery = deletePart + inserTPart + wherePart;

            
            return client.query(updateQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in update:\n" + error));

        }

        //Getting data
        var dataObj = req.body.dataObj;

        //Executing queries
        updateClass(dataObj)
            .then(function () {
                res.send("Actualizado!");
            })
            .catch(error => console.error(error));
    })

    //inserts a new class into the DB
    app.post('/createClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV', {
            updateEndpoint: 'http://localhost:7200/repositories/M51-CLAV/statements'
        })
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
                owl: 'http://www.w3.org/2002/07/owl#',
            });


        //Create new organization
        function createClass(data) {
            var id = "c" + data.Code;
            var level = "Classe_N" + data.Level;

            var createQuery = `
                INSERT DATA {
                    clav:`+ id + ` rdf:type owl:NamedIndividual ,
                            clav:`+ level + ` ;
                        clav:codigo "`+ data.Code + `" ;
                        clav:classeStatus "`+ data.Status + `" ;
                        clav:descricao "`+ data.Description.replace(/\n/g, '\\n') + `" ;
                        clav:pertenceLC clav:lc1 ;
                        clav:titulo "`+ data.Title + `" .                   
            `;

            if (data.Level > 1) {
                createQuery += 'clav:' + id + ' clav:temPai clav:' + data.Parent + ' .\n';
            }

            if (data.AppNotes && data.AppNotes.length) {
                for (var i = 0; i < data.AppNotes.length; i++) {
                    createQuery += `
                        clav:`+ data.AppNotes[i].id + ` rdf:type owl:NamedIndividual ,
                                clav:NotaAplicacao ;
                            clav:conteudo "`+ data.AppNotes[i].Note.replace(/\n/g, '\\n') + `" .
                    `;
                    createQuery += 'clav:' + id + ' clav:temNotaAplicacao clav:' + data.AppNotes[i].id + ' .\n';
                }
            }

            if (data.ExAppNotes && data.ExAppNotes.length) {
                for (var i = 0; i < data.ExAppNotes.length; i++) {
                    createQuery += 'clav:' + id + ' clav:exemploNA "' + data.ExAppNotes[i].replace(/\n/g, '\\n') + '" .\n';
                }
            }

            if (data.DelNotes && data.DelNotes.length) {
                for (var i = 0; i < data.DelNotes.length; i++) {
                    createQuery += `
                        clav:`+ data.DelNotes[i].id + ` rdf:type owl:NamedIndividual ,
                                clav:NotaExclusao ;
                            clav:conteudo "`+ data.DelNotes[i].Note.replace(/\n/g, '\\n') + `" .
                    `;
                    createQuery += 'clav:' + id + ' clav:temNotaExclusao clav:' + data.DelNotes[i].id + ' .\n';
                }
            }

            if (data.Level == 3 && data.Type) {
                createQuery += 'clav:' + id + ' clav:processoTipo "' + data.Type + '" .\n';
            }

            if (data.Level == 3 && data.Trans) {
                createQuery += 'clav:' + id + ' clav:processoTransversal "' + data.Trans + '" .\n';
            }

            if (data.Level == 3 && data.Owners && data.Owners.length) {
                for (var i = 0; i < data.Owners.length; i++) {
                    createQuery += 'clav:' + id + ' clav:temDono clav:' + data.Owners[i].id + ' .\n';
                }
            }

            if (data.Level == 3 && data.Trans == 'S' && data.Participants) {
                var keys = Object.keys(data.Participants);

                for (var k = 0; k < keys.length; k++) {
                    for (var i = 0; i < data.Participants[keys[k]].length; i++) {
                        createQuery += 'clav:' + id + ' clav:temParticipante' + keys[k] + ' clav:' + data.Participants[keys[k]][i].id + ' .\n';
                    }
                }
            }

            if (data.Level == 3 && data.RelProcs && data.RelProcs.length) {
                for (var i = 0; i < data.RelProcs.length; i++) {
                    createQuery += 'clav:' + id + ' clav:temRelProc clav:' + data.RelProcs[i].id + ' .\n';
                    createQuery += 'clav:' + data.RelProcs[i].id + ' clav:temRelProc clav:' + id + ' .\n';
                }
            }

            if (data.Legislations && data.Legislations.length) {
                for (var i = 0; i < data.Legislations.length; i++) {
                    createQuery += 'clav:' + id + ' clav:temLegislacao clav:' + data.Legislations[i].id + ' .\n';
                }
            }

            createQuery += '}';

                        
            return client.query(createQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in create:\n" + error));
            
        }

        //Getting data
        var data = req.body;
        
        createClass(data)
        .then(function () {
            res.send("Classe Inserida!");
        })
        .catch(error => console.error(error));    
    })

    //Deletes a class 
    app.post('/deleteClass', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV', {
                updateEndpoint: 'http://localhost:7200/repositories/M51-CLAV/statements'
            })
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
        });

        function deleteClass(id) {
            var delQuery = `
                DELETE {
                    clav:`+id+` ?p ?o .
                    ?relS ?relP clav:`+id+` .
                    ?na ?naP ?naO .
                    ?ne ?neP ?neO .
                }
                WHERE {
                    clav:`+id+` ?p ?o .
                    OPTIONAL {
                        ?relS ?relP clav:`+id+` .
                    }
                    OPTIONAL {
                        clav:`+id+` clav:temNotaAplicacao ?na .
                        ?na ?naP ?naO .
                    }
                    OPTIONAL{
                        clav:`+id+` clav:temNotaExclusao ?ne .
                        ?ne ?neP ?neO .
                    }
                }
            `;
            
            return client.query(delQuery).execute()
                //getting the content we want
                .then(response => Promise.resolve(response))
                .catch(function (error) {
                    console.error(error);
                });
        }

        var id = req.body.id;

        //Answer the request
        deleteClass(id)
            .then(function() {
                res.send("Entrada apagada!");
            })
            .catch(function (error) {
                console.error(error);
        });
    })
}
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

    app.get('/selTabs', function (req, res) {
        
        function fetchList() {
            return client.query(
                `SELECT * WHERE { 
                    ?id rdf:type clav:TabelaSelecao ;
                        clav:designacao ?Name .
                }`
            )
                .execute()
                //getting the content we want
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }

        fetchList()
            .then(list => res.send(list))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.get('/selTab', function (req, res) {
        var url = require('url');

        function fetch(id) {
            return client.query(
                `SELECT * WHERE { 
                    clav:`+ id + ` rdf:type clav:TabelaSelecao ;
                        clav:designacao ?Name .
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
        var id = parts.query.table;

        fetch(id)
            .then(result => res.send(result))
            .catch(function (error) {
                console.error(error);
            });
    })

    app.post('/createSelTab', function (req, res) {
        //get a list of all table IDs
        function fetchList() {
            return client.query(
                `SELECT * WHERE { 
                    ?id rdf:type clav:TabelaSelecao ;
                }`
            ).execute()
                .then(response => Promise.resolve(response.results.bindings))
                .catch(function (error) {
                    console.error(error);
                });
        }


        //generate a new ID
        function genID(ids) {
            var newIDNum = 1;

            var list = ids
            .map(item => parseInt(
                item.id.value.replace(/[^#]+#ts_(.*)/, '$1')
            )).sort((a,b) => a-b)

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


        //Create new organization
        function createLeg(id, name, classes) {
            var createQuery = SPARQL`
                INSERT DATA {
                    clav:`+ id + ` rdf:type owl:NamedIndividual ,
                            clav:TabelaSelecao ;
                        clav:designacao '`+ name + `' .
            `;

            if (classes && classes.length) {
                for (var i = 0; i < classes.length; i++) {
                    createQuery += "clav:" + classes[i] + " clav:pertenceTS clav:" + id + " .\n";
                }
            }

            createQuery += "}"


            return client.query(createQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in create:\n" + error));
        }

        //Parsing body to get parameters
        var parts = req.body;
        var name = parts.name;
        var classes = parts.classes;


        //Executing queries

        fetchList()
            .then(function (list) {
                var id = genID(list);

                createLeg(id, name, classes)
                    .then(function () {
                        res.send(id);
                    })
                    .catch(error => console.error(error)
                    );
            })
            .catch(error => console.error(error)
            );

    })
}
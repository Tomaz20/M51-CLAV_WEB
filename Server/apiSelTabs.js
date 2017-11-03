module.exports = function (app) {

    app.get('/selTabs', function (req, res) {
        const { SparqlClient, SPARQL } = require('sparql-client-2');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

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
        const { SparqlClient, SPARQL } = require('sparql-client-2');
        var url = require('url');

        const client = new SparqlClient('http://localhost:7200/repositories/M51-CLAV')
            .register({
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                clav: 'http://jcr.di.uminho.pt/m51-clav#',
            });

        function fetch(id) {
            return client.query(
                `SELECT * WHERE { 
                    clav:`+id+` rdf:type clav:TabelaSelecao ;
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
        function createLeg(id,name, classes) {
            var createQuery = SPARQL`
                INSERT DATA {
                    clav:`+id+` rdf:type owl:NamedIndividual ,
                            clav:TabelaSelecao ;
                        clav:designacao '`+name+`' .
            `;
            
            if(classes && classes.length){
                for(var i=0;i<classes.length;i++){
                    createQuery+="clav:"+classes[i]+" clav:pertenceTS clav:"+id+" .\n";
                }
            }

            createQuery+="}"

            
            return client.query(createQuery).execute()
                .then(response => Promise.resolve(response))
                .catch(error => console.error("Error in create:\n" + error));
            }

        //Parsing body to get parameters
        var parts = req.body;
        var id = parts.id;
        var name = parts.name;
        var classes = parts.classes;


        //Executing queries
        createLeg(id,name,classes)
            .then(function () {
                res.send("Inserido!");
            })
            .catch(error => console.error(error)
            );
    })
}
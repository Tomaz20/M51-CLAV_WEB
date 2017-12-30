const { SparqlClient, SPARQL } = require('sparql-client-2');

module.exports.onthology = new SparqlClient('http://localhost:7200/repositories/M51-CLAV', {
    updateEndpoint: 'http://localhost:7200/repositories/M51-CLAV/statements'
}).register({
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    clav: 'http://jcr.di.uminho.pt/m51-clav#',
    owl: 'http://www.w3.org/2002/07/owl#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    noInferences: 'http://www.ontotext.com/explicit'
});

module.exports.userDB = 'mongodb://localhost/m51-clav'
const client = require('../../config/database').onthology;

var TermosIndice = module.exports

TermosIndice.list = function () {
    let fetchQuery = `
        SELECT * WHERE { 
        ?s rdf:type clav:TermoIndice ;
            clav:termo ?Termo ;
            clav:estaAssocClasse ?id .
        ?id clav:codigo ?Classe ;
            clav:titulo ?Tit .
    }`;

    return client.query(fetchQuery)
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

TermosIndice.fromClass = function (clas) {
    let fetchQuery = `
        SELECT * WHERE { 
        ?id rdf:type clav:TermoIndice ;
            clav:termo ?Termo ;
            clav:estaAssocClasse clav:${clas} .
    }`;

    return client.query(fetchQuery)
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

TermosIndice.lastID = function () {
    let fetchQuery = `
        SELECT * WHERE { 
            ?id rdf:type clav:TermoIndice
        } ORDER BY DESC(?id)
        LIMIT 1
    `;

    return client.query(fetchQuery)
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings[0]))
        .catch(function (error) {
            console.error(error);
        });
}
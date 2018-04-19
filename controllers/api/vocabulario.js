const client = require('../../config/database').onthology;

var Vocabulario = module.exports

Vocabulario.formasContagemPCA = function () {
    let fetchQuery = `
        SELECT DISTINCT ?id ?Label WHERE { 
            ?pca clav:pcaFormaContagemNormalizada ?id .    
            ?id skos:prefLabel ?Label .
        } 
    `;

    return client.query(fetchQuery)
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}
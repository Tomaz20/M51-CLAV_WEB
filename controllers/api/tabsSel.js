const client = require('../../config/database').onthology;

var SelTabs = module.exports

SelTabs.list = function () {
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

SelTabs.listClasses = function (level, table) {
    if (!level) {
        level = 1;
    }

    var listQuery = `
            SELECT ?id ?Code ?Title (count(?sub) as ?NChilds) FROM noInferences:
            WHERE {
                ?id rdf:type clav:Classe_N${level} ;
                    clav:codigo ?Code ;
                    clav:titulo ?Title ;
                    clav:pertenceTS clav:${table} .
                optional {
                    ?sub clav:temPai ?id ;
                        clav:pertenceTS clav:${table} .
                }
            }Group by ?id ?Code ?Title
        `;


    return client.query(listQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

SelTabs.classChildren = function (parent, table) {
    var fetchQuery = `
        SELECT ?Child ?Code ?Title (count(?sub) as ?NChilds)
        WHERE {
            ?Child clav:temPai clav:${parent} ;
                    clav:codigo ?Code ;
                    clav:titulo ?Title ;
                    clav:pertenceTS clav:${table} .
            optional {
                ?sub clav:temPai ?Child ;
                clav:pertenceTS clav:${table} .
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

SelTabs.stats = function (id) {
    return client.query(
        `SELECT * WHERE { 
                clav:${id} rdf:type clav:TabelaSelecao ;
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

SelTabs.createTab = function (id, dataObj) {
    var createQuery = `
            INSERT DATA {
                clav:${id} rdf:type owl:NamedIndividual ,
                        clav:TabelaSelecao ;
                    clav:designacao '${dataObj.name}' .
        `;

    for (let clas of dataObj.classes) {
        createQuery += `clav:${clas} clav:pertenceTS clav:${id} .\n`;
    }

    createQuery += "}"


    return client.query(createQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in create:\n" + error));
}

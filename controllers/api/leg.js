const client = require('../../config/database').onthology;

var Leg = module.exports

Leg.list = function () {
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

Leg.stats = function (id) {
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

Leg.regulates = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                ?id clav:temLegislacao clav:`+ id + `;
                    clav:codigo ?Code;
                    clav:titulo ?Title;
            }`;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Leg.checkNumberAvailability = function (number) {
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

Leg.createDoc = function (newID, dataObj) {
    var createQuery = SPARQL`
            INSERT DATA {
                ${{ clav: newID }} rdf:type owl:NamedIndividual ,
                        clav:Legislacao ;
                    clav:diplomaAno ${dataObj.year} ;
                    clav:diplomaData ${dataObj.date} ;
                    clav:diplomaNumero ${dataObj.number} ;
                    clav:diplomaTipo ${dataObj.type} ;
                    clav:diplomaTitulo ${dataObj.title} ;
                    clav:diplomaLink ${dataObj.link} .
            }
        `;

    return client.query(createQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in create:\n" + error));
}

Leg.updateDoc = function(dataObj) {
    var del = "";
    var ins = "";
    var wer = "";

    if (year) {
        del += `clav:${dataObj.id} clav:diplomaAno ?y .\n`;
        ins += `clav:${dataObj.id} clav:diplomaAno "${dataObj.year}" .\n`;
    }
    if (date) {
        del += `clav:${dataObj.id} clav:diplomaData ?d .\n`;
        ins += `clav:${dataObj.id} clav:diplomaData "${dataObj.date}" .\n`;
    }
    if (number) {
        del += `clav:${dataObj.id} clav:diplomaNumero ?n .\n`;
        ins += `clav:${dataObj.id} clav:diplomaNumero "${dataObj.number}" .\n`;
    }
    if (type) {
        del += `clav:${dataObj.id} clav:diplomaTipo ?t .\n`;
        ins += `clav:${dataObj.id} clav:diplomaTipo "${dataObj.type}" .\n`;
    }
    if (title) {
        del += `clav:${dataObj.id} clav:diplomaTitulo ?tit .\n`;
        ins += `clav:${dataObj.id} clav:diplomaTitulo "${dataObj.title}" .\n`;
    }
    if (link) {
        del += `clav:${dataObj.id} clav:diplomaLink ?l .\n`;
        ins += `clav:${dataObj.id} clav:diplomaLink "${dataObj.link}" .\n`;
    }

    wer = "WHERE {" + del + "}\n";
    del = "DELETE {" + del + "}\n";
    ins = "INSERT {" + ins + "}\n";

    var updateQuery = del + ins + wer;

    return client.query(updateQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in update:\n" + error));
}

Leg.deleteDoc = function(id){
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
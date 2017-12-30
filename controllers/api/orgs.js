const client = require('../../config/database').onthology;

var Orgs = module.exports

Orgs.list = function () {
    return client.query(
        `SELECT * {
            {
                SELECT ?id ?Nome ?Sigla where {
                    ?id rdf:type clav:Organizacao .
                }
            } UNION {
                SELECT ?id ?Nome ?Sigla where {
                    ?id rdf:type clav:TipologiaOrganizacao .
                }
            } UNION {
                SELECT ?id ?Nome ?Sigla where {
                    ?id rdf:type clav:ConjuntoOrganizacoes .
                }
            }
            ?id rdf:type ?Tipo ;
                clav:orgNome ?Nome ;
                clav:orgSigla ?Sigla
            filter(?Tipo!=owl:NamedIndividual)
        }`
    )
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Listagem: " + error);
        });
}

Orgs.inConjs = function (id) {
    return client.query(
        `SELECT * FROM noInferences: WHERE {
            clav:${id} clav:pertenceConjOrg ?id .
            ?id rdf:type ?Tipo ;
                clav:orgNome ?Nome ;
                clav:orgSigla ?Sigla .
            filter(?Tipo!=owl:NamedIndividual)
        }`
    )
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Conjuntos a que x pertence: " + error);
        });
}

Orgs.inTipols = function (id) {
    var fetchQuery = `
            SELECT * FROM noInferences: WHERE {
                clav:${id} clav:pertenceTipologiaOrg ?id .
                ?id rdf:type ?Tipo ;
                    clav:orgNome ?Nome ;
                    clav:orgSigla ?Sigla .
                    
                filter(?Tipo!=owl:NamedIndividual)
            }`;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Tipologias a que x pertence: " + error);
        });
}

Orgs.elems = function (id) {
    return client.query(
        `SELECT * WHERE {
            clav:${id} clav:temOrg ?id .
            ?id rdf:type ?Tipo ;
                clav:orgNome ?Nome ;
                clav:orgSigla ?Sigla .
            filter(?Tipo!=owl:NamedIndividual)
        }`
    )
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Elementos num grupo: " + error);
        });
}

Orgs.stats = function (id) {
    return client.query(`
        SELECT ?Nome ?Sigla ?Tipo where {
            clav:${id} clav:orgNome ?Nome ;
                rdf:type ?Tipo ;
                clav:orgSigla ?Sigla .
            filter(?Tipo!=owl:NamedIndividual)
        }`
    )
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Dados de uma org: " + error);
        });
}

Orgs.domain = function (id) {
    var fetchQuery = `
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
            console.error("Dominio de org: " + error);
        });
}

Orgs.participations = function (id) {
    var fetchQuery = `
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
            console.error("Participações de org: " + error);
        });
}

Orgs.checkAvailability = function (name, initials) {
    var checkQuery = `
        SELECT (count(*) as ?Count) where { 
            ?o clav:orgSigla ?s ;
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

Orgs.checkNameAvailability = function (name) {
    var checkQuery = ` 
        SELECT (count(*) as ?Count) where { 
            ?o clav:orgNome '${name}' .
        }
    `;

    return client.query(checkQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings[0].Count.value))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Orgs.createOrg = function (id, name, initials, type) {
    var createQuery = `
        INSERT DATA {
            clav:${id} rdf:type owl:NamedIndividual ,
                    clav:${type} ;
                clav:orgNome '${name}' ;
                clav:orgSigla '${initials}'
        }
    `;

    return client.query(createQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in create:\n" + error));
}

Orgs.updateOrg = function (dataObj) {

    function prepDelete(dataObj) {
        var ret = "";

        if (dataObj.domain.del && dataObj.domain.del.length) {
            for (let process of dataObj.domain.del) {
                ret += `\tclav:${process.id} clav:temDono clav:${dataObj.id} .\n`;
            }
        }

        for (const pType in dataObj.parts) {
            if (dataObj.parts[pType].del && dataObj.parts[pType].del.length) {
                for (let p of dataObj.parts[pType].del) {
                    ret += "\tclav:" + p.id + " clav:temParticipante" + pType + " clav:" + dataObj.id + " .\n";
                }
            }
        }

        if (dataObj.conjs.del && dataObj.conjs.del.length) {
            for (let conj of dataObj.conjs.del) {
                ret += `\tclav:${dataObj.id} clav:pertenceConjOrg clav:${conj.id} .\n`;
            }
        }

        if (dataObj.tipols.del && dataObj.tipols.del.length) {
            for (let tipol of dataObj.tipols.del) {
                ret += `\tclav:${dataObj.id} clav:pertenceTipologiaOrg clav:${tipol.id} .\n`;
            }
        }

        if (dataObj.elems.del && dataObj.elems.del.length) {
            for (let org of dataObj.elems.del) {
                if (dataObj.type == "Conjunto") {
                    ret += `\tclav:${org.id} clav:pertenceConjOrg clav:${dataObj.id} .\n`;
                }
                else {
                    ret += `\tclav:${org.id} clav:pertenceTipologiaOrg clav:${dataObj.id} .\n`;
                }
            }
        }

        return ret;
    }

    function prepInsert(dataObj) {
        var ret = "";

        if (dataObj.initials) {
            ret += `\tclav:${dataObj.id} clav:orgSigla '${dataObj.initials}' .\n`;
        }

        if (dataObj.name) {
            ret += `\tclav:${dataObj.id} clav:orgNome '${dataObj.name}' .\n`;
        }

        if (dataObj.domain.add && dataObj.domain.add.length) {
            for (let process of dataObj.domain.add) {
                ret += `\tclav:${process.id} clav:temDono clav:${dataObj.id} .\n`;
            }
        }

        for (const pType in dataObj.parts) {
            if (dataObj.parts[pType].add && dataObj.parts[pType].add.length) {
                for (let p of dataObj.parts[pType].add) {
                    ret += "\tclav:" + p.id + " clav:temParticipante" + pType + " clav:" + dataObj.id + " .\n";
                }
            }
        }

        if (dataObj.conjs.add && dataObj.conjs.add.length) {
            for (let conj of dataObj.conjs.add) {
                ret += `\tclav:${dataObj.id} clav:pertenceConjOrg clav:${conj.id} .\n`;
            }
        }

        if (dataObj.tipols.add && dataObj.tipols.add.length) {
            for (let tipol of dataObj.tipols.add) {
                ret += `\tclav:${dataObj.id} clav:pertenceTipologiaOrg clav:${tipol.id} .\n`;
            }
        }

        if (dataObj.elems.add && dataObj.elems.add.length) {
            for (let org of dataObj.elems.add) {
                if (dataObj.type == "Conjunto") {
                    ret += `\tclav:${org.id} clav:pertenceConjOrg clav:${dataObj.id} .\n`;
                }
                else if (dataObj.type == "Tipologia") {
                    ret += `\tclav:${org.id} clav:pertenceTipologiaOrg clav:${dataObj.id} .\n`;
                }
            }
        }

        return ret;
    }

    function prepWhere(dataObj) {
        var ret = "";

        if (dataObj.initials) {
            ret += `\tclav:${dataObj.id} clav:orgSigla ?s .\n`;
        }

        if (dataObj.name) {
            ret += `\tclav:${dataObj.id} clav:orgNome ?n .\n`;
        }

        return ret;
    }

    var deletePart = "DELETE {\n" + prepWhere(dataObj) + prepDelete(dataObj) + "}\n";
    var inserTPart = "INSERT {\n" + prepInsert(dataObj) + "}\n";
    var wherePart = "WHERE {\n" + prepWhere(dataObj) + "}\n";

    var updateQuery = deletePart + inserTPart + wherePart;

    return client.query(updateQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in update:\n" + error));
}

Orgs.deleteOrg = function (id) {
    var deleteQuery = `
        DELETE {
            clav:${id} ?o ?p .
            ?s ?o clav:${id}
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
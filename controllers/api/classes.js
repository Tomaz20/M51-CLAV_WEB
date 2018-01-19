const client = require('../../config/database').onthology;

var Classes = module.exports

Classes.list = function (level) {
    if (!level) { level = 1 }

    var listQuery = `
            SELECT ?id ?Code ?Title (count(?sub) as ?NChilds) FROM noInferences:
            WHERE {
                ?id rdf:type clav:Classe_N${level} ;
                    clav:codigo ?Code ;
                    clav:titulo ?Title .
                optional {
                    ?sub clav:temPai ?id .
                }
            }Group by ?id ?Code ?Title
        `;


    return client.query(listQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.stats = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:titulo ?Titulo;
                    clav:codigo ?Codigo;
                OPTIONAL {
                    clav:${id} clav:temPai ?Pai.
                    ?Pai clav:codigo ?CodigoPai;
                        clav:titulo ?TituloPai.
                } OPTIONAL {
                    clav:${id} clav:classeStatus ?Status.
                } OPTIONAL {
                    clav:${id} clav:descricao ?Desc.
                } OPTIONAL {
                    clav:${id} clav:processoTipo ?ProcTipo.
                } OPTIONAL {
                    clav:${id} clav:processoTransversal ?ProcTrans.
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

Classes.completeData = function (classes) {
    var fetchQuery = `
        SELECT 
            ?id 
            ?Titulo 
            ?Codigo 
            ?Pai 
            ?CodigoPai 
            ?TituloPai 
            ?Status 
            ?Descricao 
            ?ProcTipo 
            ?ProcTrans 
            (group_concat(distinct ?Exemplo;separator="%%") as ?Exemplos) 
            (group_concat(distinct ?Dono;separator="%%") as ?Donos) 
            (group_concat(distinct ?NotaA;separator="%%") as ?NotasA) 
            (group_concat(distinct ?NotaE;separator="%%") as ?NotasE) 
            (group_concat(distinct ?Participante1;separator="%%") as ?Parts1) 
            (group_concat(distinct ?Participante2;separator="%%") as ?Parts2) 
            (group_concat(distinct ?Participante3;separator="%%") as ?Parts3) 
            (group_concat(distinct ?Participante4;separator="%%") as ?Parts4) 
            (group_concat(distinct ?Participante5;separator="%%") as ?Parts5) 
            (group_concat(distinct ?Participante6;separator="%%") as ?Parts6) 
            (group_concat(distinct ?Leg;separator="%%") as ?Diplomas) 
            (group_concat(distinct ?Rel1;separator="%%") as ?Rels1) 
            (group_concat(distinct ?Rel2;separator="%%") as ?Rels2) 
            (group_concat(distinct ?Rel3;separator="%%") as ?Rels3) 
            (group_concat(distinct ?Rel4;separator="%%") as ?Rels4) 
            (group_concat(distinct ?Rel5;separator="%%") as ?Rels5) 
            (group_concat(distinct ?Rel6;separator="%%") as ?Rels6) 
            (group_concat(distinct ?Rel7;separator="%%") as ?Rels7) 
        FROM noInferences: WHERE {
            VALUES ?id { ${'clav:' + classes.join(' clav:')} }
            ?id clav:titulo ?Titulo;
                clav:codigo ?Codigo.
            OPTIONAL {
                ?id clav:temPai ?Pai.
                ?Pai clav:codigo ?CodigoPai;
                    clav:titulo ?TituloPai.
            } 
            OPTIONAL {
                ?id clav:classeStatus ?Status.
            } 
            OPTIONAL {
                ?id clav:descricao ?Descricao.
            } 
            OPTIONAL {
                ?id clav:processoTipo ?ProcTipo.
            } 
            OPTIONAL {
                ?id clav:processoTransversal ?ProcTrans.
            } 
            OPTIONAL {
                ?id clav:exemploNA ?Exemplo.
            }
            OPTIONAL {
                ?id clav:temDono ?Dono.
            }
            OPTIONAL {
                ?id clav:temNotaAplicacao ?NotaA.
            }
            OPTIONAL {
                ?id clav:temNotaExclusao ?NotaE.
            }
            OPTIONAL {
                ?id clav:temParticipanteApreciador ?Participante1.
            }
            OPTIONAL {
                ?id clav:temParticipanteAssessor ?Participante2.
            }
            OPTIONAL {
                ?id clav:temParticipanteComunicador ?Participante3.
            }
            OPTIONAL {
                ?id clav:temParticipanteDecisor ?Participante4.
            }
            OPTIONAL {
                ?id clav:temParticipanteExecutor ?Participante5.
            }
            OPTIONAL {
                ?id clav:temParticipanteIniciador ?Participante6.
            }
            OPTIONAL {
                ?id clav:temLegislacao ?Leg.
            }
            OPTIONAL {
                ?id clav:eSintetizadoPor ?Rel1.
            }
            OPTIONAL {
                ?id clav:eSinteseDe ?Rel2.
            }
            OPTIONAL {
                ?id clav:eComplementarDe ?Rel3.
            }
            OPTIONAL {
                ?id clav:eCruzadoCom ?Rel4.
            }
            OPTIONAL {
                ?id clav:eSuplementoPara ?Rel5.
            }
            OPTIONAL {
                ?id clav:eSucessorDe ?Rel6.
            }
            OPTIONAL {
                ?id clav:eAntecessorDe ?Rel7.
            }
        } GROUP BY ?id ?Titulo ?Codigo ?Pai ?CodigoPai ?TituloPai ?Status ?Descricao ?ProcTipo ?ProcTrans  
    `;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.children = function (id) {
    var fetchQuery = `
        SELECT ?Child ?Code ?Title (count(?sub) as ?NChilds)
        WHERE {
            ?Child clav:temPai clav:${id} ;
                    clav:codigo ?Code ;
                    clav:titulo ?Title .
            optional {
                ?sub clav:temPai ?Child .
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

Classes.owners = function (id) {
    var fetchQuery = `
                SELECT * WHERE { 
                    clav:${id} clav:temDono ?id.
                    ?id clav:orgNome ?Nome;
                        clav:orgSigla ?Sigla;
                }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.legislation = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:temLegislacao ?id.
                ?id clav:diplomaNumero ?Número;
                    clav:diplomaTitulo ?Titulo;
                    clav:diplomaTipo ?Tipo;
            }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.exAppNotes = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:exemploNA ?Exemplo.
            }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.appNotes = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:temNotaAplicacao ?id.
                ?id clav:conteudo ?Nota .
            }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.delNotes = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:temNotaExclusao ?id.
                ?id clav:conteudo ?Nota .
            }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.related = function (id) {
    var fetchQuery = `
            select DISTINCT ?id ?Type ?Code ?Title {
                clav:${id} clav:temRelProc ?id;
                    ?Type ?id.
                
                    ?id clav:codigo ?Code;
                    clav:titulo ?Title
                
                    filter (?Type!=clav:temRelProc)
            } Order by ?Type
        `;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.participants = function (id) {
    var fetchQuery = `
            select * where { 
                clav:${id} clav:temParticipante ?id ;
                    ?Type ?id .
                
                ?id clav:orgNome ?Nome ;
                    clav:orgSigla ?Sigla .
                
                filter (?Type!=clav:temParticipante && ?Type!=clav:temDono)
            }
        `;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.updateClass = function (dataObj) {
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

        var relKeys = Object.keys(dataObj.RelProcs);

        for (var k = 0; k < relKeys.length; k++) {
            if (dataObj.RelProcs[relKeys[k]].Delete && dataObj.RelProcs[relKeys[k]].Delete.length) {
                for (var i = 0; i < dataObj.RelProcs[relKeys[k]].Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:e" + relKeys[k].replace(/ /, '') + " clav:" + dataObj.RelProcs[relKeys[k]].Delete[i].id + " .\n";
                }
            }
        }

        var partKeys = Object.keys(dataObj.Participants);

        for (var k = 0; k < partKeys.length; k++) {
            if (dataObj.Participants[partKeys[k]].Delete && dataObj.Participants[partKeys[k]].Delete.length) {
                for (var i = 0; i < dataObj.Participants[partKeys[k]].Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temParticipante" + partKeys[k] + " clav:" + dataObj.Participants[partKeys[k]].Delete[i].id + " .\n";
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
                wherePart += "\tclav:" + dataObj.AppNotes.Delete[i].id + " ?NAp" + i + " ?NAo" + i + " .\n";
            }
        }
        if (dataObj.DelNotes.Delete && dataObj.DelNotes.Delete.length) {
            for (var i = 0; i < dataObj.DelNotes.Delete.length; i++) {
                wherePart += "\tclav:" + dataObj.DelNotes.Delete[i].id + " ?NEp" + i + " ?NEo" + i + " .\n";
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
                        clav:${dataObj.AppNotes.Add[i].id} rdf:type owl:NamedIndividual ,
                                clav:NotaAplicacao ;
                            clav:conteudo "${dataObj.AppNotes.Add[i].Nota.replace(/\n/g, '\\n')}" .
                    `;
                insertPart += "\tclav:" + dataObj.id + " clav:temNotaAplicacao clav:" + dataObj.AppNotes.Add[i].id + " .\n";
            }
        }
        //Notas de exclusão
        if (dataObj.DelNotes.Add && dataObj.DelNotes.Add.length) {
            for (var i = 0; i < dataObj.DelNotes.Add.length; i++) {
                insertPart += `
                        clav:${dataObj.DelNotes.Add[i].id} rdf:type owl:NamedIndividual ,
                                clav:NotaExclusao ;
                            clav:conteudo "${dataObj.DelNotes.Add[i].Nota.replace(/\n/g, '\\n')}" .
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
        var relKeys = Object.keys(dataObj.RelProcs);

        for (var k = 0; k < relKeys.length; k++) {
            if (dataObj.RelProcs[relKeys[k]].Add && dataObj.RelProcs[relKeys[k]].Add.length) {
                for (var i = 0; i < dataObj.RelProcs[relKeys[k]].Add.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:e" + relKeys[k].replace(/ /, '') + " clav:" + dataObj.RelProcs[relKeys[k]].Add[i].id + " .\n";
                }
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

    var deletePart = "DELETE {" + prepWhere(dataObj) + prepDelete(dataObj) + "}\n";

    var inserTPart = "INSERT {" + prepInsert(dataObj) + "}\n";

    var wherePart = "WHERE {" + prepWhere(dataObj) + "}\n";


    var updateQuery = deletePart + inserTPart + wherePart;


    return client.query(updateQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in update:\n" + error));

}

Classes.checkCodeAvailability = function (code) {
    var checkQuery = `
            SELECT (count(*) AS ?Count) WHERE {
                ?c rdf:type clav:Classe_N1 ;
                    clav:codigo '${code}'
            }
        `;

    return client.query(checkQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings[0].Count.value))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.createClass = function (data) {
    var id = "c" + data.Code;
    var level = "Classe_N" + data.Level;

    var createQuery = `
            INSERT DATA {
                clav:${id} rdf:type owl:NamedIndividual ,
                        clav:${level} ;
                    clav:codigo "${data.Code}" ;
                    clav:classeStatus "${data.Status}" ;
                    clav:descricao "${data.Description.replace(/\n/g, '\\n')}" ;
                    clav:pertenceLC clav:lc1 ;
                    clav:titulo "${data.Title}" .                   
        `;

    if (data.Level > 1) {
        createQuery += 'clav:' + id + ' clav:temPai clav:' + data.Parent + ' .\n';
    }

    if (data.AppNotes && data.AppNotes.length) {
        for (var i = 0; i < data.AppNotes.length; i++) {
            createQuery += `
                    clav:${data.AppNotes[i].id} rdf:type owl:NamedIndividual ,
                            clav:NotaAplicacao ;
                        clav:conteudo "${data.AppNotes[i].Note.replace(/\n/g, '\\n')}" .
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
                    clav:${data.DelNotes[i].id} rdf:type owl:NamedIndividual ,
                            clav:NotaExclusao ;
                        clav:conteudo "${data.DelNotes[i].Note.replace(/\n/g, '\\n')}" .
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

    if (data.Level == 3 && data.RelProcs) {
        var keys = Object.keys(data.RelProcs);

        for (var k = 0; k < keys.length; k++) {
            for (var i = 0; i < data.RelProcs[keys[k]].length; i++) {
                createQuery += 'clav:' + id + ' clav:e' + keys[k].replace(/ /, '') + ' clav:' + data.RelProcs[keys[k]][i].id + ' .\n';
            }
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

Classes.deleteClass = function (id) {
    var delQuery = `
            DELETE {
                clav:${id} ?p ?o .
                ?relS ?relP clav:${id} .
                ?na ?naP ?naO .
                ?ne ?neP ?neO .
            }
            WHERE {
                clav:${id} ?p ?o .
                OPTIONAL {
                    ?relS ?relP clav:${id} .
                }
                OPTIONAL {
                    clav:${id} clav:temNotaAplicacao ?na .
                    ?na ?naP ?naO .
                }
                OPTIONAL{
                    clav:${id} clav:temNotaExclusao ?ne .
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
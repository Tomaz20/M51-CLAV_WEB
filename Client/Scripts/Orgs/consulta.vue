new Vue({
    el: '#organizacao-form',
    data: {
        id: "",
        type: "",
        
        orgName: "",
        newName: "",
        editName: false,

        orgInitials: "",
        content: [],
        message: "",
        delConfirm: false,

        domain: [],
        newClass: "",
        newDomain: [],
        domainReady: false,
        editDomain: false,

        participations: [],
        newPartType: "",
        newPart: "",
        newParticipations: [],
        partsReady: false,
        editParts: false,

        classList: [],

        partsCollapsed: {
            Apreciador: true,
            Assessor: true,
            Comunicador: true,
            Decisor: true,
            Executor: true,
            Iniciador: true,
        },
        domainCollapsed: true,

        editConj: false,
        newConj: "",
        conjList: [],
        myConjList: [],
        myNewConjList: [],

        editElems: false,
        newElem: "",
        orgList: [],
        elemList: [],
        newElemList: [],

        editTipol: false,
        newTipol: "",
        tipolList: [],
        myTipolList: [],
        myNewTipolList: [],

    },
    methods: {
        getParameterByName: function (name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        subtractArray: function (from, minus) {
            var ret;

            if (!from) {
                ret = null;
            }
            else if (!minus) {
                ret = JSON.parse(JSON.stringify(from));
            }
            else {
                ret = from.filter(function (item) {
                    var r= true;
                    for (var i = 0; i < minus.length; i++) {
                        if (minus[i].id == item.id) {
                            r= false;
                            break;
                        }
                    }

                    return r;
                });
            }

            return ret;
        },
        loadClasses: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/classesn?level=3")
                .then(function (response) {
                    classesToParse = response.body;
                })
                .then(function () {
                    this.classList = this.parseList(classesToParse, keys).map(function (item) {
                        return {
                            label: item.Code + " - " + item.Title,
                            value: item,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });

                    this.classesReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadOrgs: function () {
            var orgsToParse = [];
            var keys = ["id", "Tipo", "Nome", "Sigla"];

            this.$http.get("/orgs")
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    var completeList = this.parseList(orgsToParse, keys);

                    //orgs or sets that can belong to a set or tipology
                    this.orgList = completeList.filter(
                        a => (a.Tipo != "Tipologia")
                    ).map(function (item) {
                        return {
                            label: item.Sigla,
                            value: item,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });

                    //sets
                    this.conjList = completeList.filter(
                        a => (a.Tipo == "Conjunto")
                    ).map(function (item) {
                        return {
                            label: item.Sigla,
                            value: item,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });

                    //tipologies
                    this.tipolList = completeList.filter(
                        a => (a.Tipo == "Tipologia")
                    ).map(function (item) {
                        return {
                            label: item.Sigla,
                            value: item,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });

                    this.orgsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadDomain: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/domainOrg?id=" + this.id)
                .then(function (response) {
                    classesToParse = response.body;
                })
                .then(function () {
                    this.domain = JSON.parse(JSON.stringify(this.parseList(classesToParse, keys)));
                    this.newDomain = JSON.parse(JSON.stringify(this.parseList(classesToParse, keys)));

                    this.domainReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadParticipations: function () {
            var partsToParse = [];
            var keys = ['id', 'Title', 'Code'];

            this.$http.get("/partsOrg?id=" + this.id)
                .then(function (response) {
                    partsToParse = response.body;
                })
                .then(function () {
                    this.participations = this.parseParticipants(partsToParse, keys);
                    this.newParticipations = JSON.parse(JSON.stringify(this.participations));

                    this.partsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadElements: function () {
            var orgsToParse = [];
            var keys = ["id", "Tipo", "Nome", "Sigla"];

            this.$http.get("/orgsInGroup?id=" + this.id)
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    this.elemList = this.parseList(orgsToParse, keys);
                    this.newElemList = JSON.parse(JSON.stringify(this.elemList));

                    this.elemsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadConjs: function () {
            var orgsToParse = [];
            var keys = ["id", "Tipo", "Nome", "Sigla"];

            this.$http.get("/inConjs?id=" + this.id)
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    this.myConjList = this.parseList(orgsToParse, keys);
                    this.myNewConjList = JSON.parse(JSON.stringify(this.myConjList));

                    this.conjsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadTipols: function () {
            var orgsToParse = [];
            var keys = ["id", "Tipo", "Nome", "Sigla"];

            this.$http.get("/inTipols?id=" + this.id)
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    this.myTipolList = this.parseList(orgsToParse, keys);
                    this.myNewTipolList = JSON.parse(JSON.stringify(this.myTipolList));

                    this.tipolsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        parse: function (content) {
            this.orgName = content[0].Nome.value;
            this.newName = content[0].Nome.value;
            this.orgInitials = content[0].Sigla.value;
            var type = content[0].Tipo.value;
            
            conj = new RegExp("#Conjunto", "g");
            tipol = new RegExp("#Tipologia", "g");

            if (conj.test(type)){
                this.type="Conjunto";
            }
            else if (tipol.test(type)){
                this.type="Tipologia";
            }
            else {
                this.type="Organização";
            }
        },
        parseList: function (content, keys) {
            var dest = [];
            var temp = {};

            // parsing the JSON
            for (var i = 0; i < content.length; i++) {
                for (var j = 0; j < keys.length; j++) {
                    temp[keys[j]] = content[i][keys[j]].value;

                    if (keys[j] == "id") {
                        temp.id = temp.id.replace(/[^#]+#(.*)/, '$1');
                    }
                    if (keys[j] == "Tipo") {

                        conj = new RegExp("#Conjunto", "g");
                        tipol = new RegExp("#Tipologia", "g");

                        if (conj.test(temp.Tipo)) {
                            temp.Tipo = "Conjunto";
                        }
                        else if (tipol.test(temp.Tipo)) {
                            temp.Tipo = "Tipologia";
                        }
                        else {
                            temp.Tipo = "Organização";
                        }
                    }
                }

                dest[i] = JSON.parse(JSON.stringify(temp));
            }

            return dest.sort(function (a, b) {
                return a.id.localeCompare(b.id);
            });
        },
        parseParticipants: function (content, keys) {
            var dest = {
                Apreciador: [],
                Assessor: [],
                Comunicador: [],
                Decisor: [],
                Executor: [],
                Iniciador: [],
            };
            var temp = {};

            // parsing the JSON
            for (var i = 0; i < content.length; i++) {
                for (var j = 0; j < keys.length; j++) {

                    temp[keys[j]] = content[i][keys[j]].value;

                    if (keys[j] == "id") {
                        temp.id = temp.id.replace(/[^#]+#(.*)/, '$1');
                    }
                }
                var type = content[i].Type.value.replace(/.*temParticipante(.*)/, '$1');

                dest[type].push(JSON.parse(JSON.stringify(temp)));
            }

            var types = Object.keys(dest);

            for (var i = 0; i < types.length; i++) {
                dest[types[i]] = dest[types[i]].sort(function (a, b) {
                    return a.id.localeCompare(b.id);
                });
            }

            return dest;
        },
        update: function () {
            var dataObj = {
                id: this.id,
                type: this.type,
                name: null,
                domain: {
                    add: null,
                    del: null,
                },
                parts: {
                    Apreciador: {
                        add: null,
                        del: null,
                    },
                    Assessor: {
                        add: null,
                        del: null,
                    },
                    Comunicador: {
                        add: null,
                        del: null,
                    },
                    Decisor: {
                        add: null,
                        del: null,
                    },
                    Executor: {
                        add: null,
                        del: null,
                    },
                    Iniciador: {
                        add: null,
                        del: null,
                    },
                },
                conjs: {
                    add: null,
                    del: null,
                },
                tipols: {
                    add: null,
                    del: null,
                },
                elems: {
                    add: null,
                    del: null,
                }
            }

            if (this.editName) {
                dataObj.name = this.newName;
            }
            if (this.editDomain) {

                var temp = {
                    add: null,
                    delete: null,
                };

                temp.add = this.subtractArray(this.newDomain, this.domain);
                temp.del = this.subtractArray(this.domain, this.newDomain);

                dataObj.domain = JSON.parse(JSON.stringify(temp));
            }
            if (this.editParts) {
                for (const pType in this.participations) {

                    var temp = {
                        add: null,
                        del: null,
                    };

                    temp.add = this.subtractArray(this.newParticipations[pType], this.participations[pType]);
                    temp.del = this.subtractArray(this.participations[pType], this.newParticipations[pType]);

                    dataObj.parts[pType] = JSON.parse(JSON.stringify(temp));
                }
            }
            if (this.editConj) {

                var temp = {
                    add: null,
                    delete: null,
                };

                temp.add = this.subtractArray(this.myNewConjList, this.myConjList);
                temp.del = this.subtractArray(this.myConjList, this.myNewConjList);

                dataObj.conjs = JSON.parse(JSON.stringify(temp));
            }
            if (this.editTipol) {    
                var temp = {
                    add: null,
                    delete: null,
                };

                temp.add = this.subtractArray(this.myNewTipolList, this.myTipolList);
                temp.del = this.subtractArray(this.myTipolList, this.myNewTipolList);

                dataObj.tipols = JSON.parse(JSON.stringify(temp));
            }
            if (this.editElems) {    
                var temp = {
                    add: null,
                    del: null,
                };

                temp.add = this.subtractArray(this.newElemList, this.elemList);
                temp.del = this.subtractArray(this.elemList, this.newElemList);

                dataObj.elems = JSON.parse(JSON.stringify(temp));
            }

            console.log(dataObj);

            this.$http.put('/updateOrg', dataObj, {
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(function (response) {
                    var resp = response.body;
                    if (resp != "Nome já existentente!") {
                        window.location.href = '/organizacao?id=' + this.id;
                    } else {
                        this.message = resp;
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        delReady: function () {
            this.message = "Tem a certeza que deseja apagar?";
            this.delConfirm = true;
        },
        delNotReady: function () {
            this.message = "";
            this.delConfirm = false;
        },
        deleteOrg: function () {
            this.$http.post('/deleteOrg', { id: this.id })
                .then(function (response) {
                    this.message = response.body;
                    window.location.href = '/organizacoes';
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    },
    created: function () {
        this.id = this.getParameterByName('id');
        this.type = this.getParameterByName('type');

        this.$http.get("/singleOrg?id=" + this.id)
            .then(function (response) {
                this.parse(response.body);
            })
            .then(function () {
                this.loadDomain();
                this.loadParticipations();
                this.loadClasses();

                if (this.type != "Organização") {
                    this.loadOrgs();
                    this.loadElements();
                }
                if (this.type != "Tipologia") {
                    this.loadConjs();
                    this.loadTipols();
                }

            })
            .catch(function (error) {
                console.error(error);
            });
    }
})
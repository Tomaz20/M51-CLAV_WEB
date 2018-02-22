var separadors = new Vue({
    el: '#tabs',
    data: {
        entidade: {
            nome: "Teste",
        },
        newTipol: null,
        tipolList: [],
        myTipolList: [],
        tableHeader: [],
        commonProcs: [],
        specificProcs: [],
        restProcs: [],
        ready: false,
        cwidth: ['15%', '81%'],
        subTemp: [],
        nEdits: 0,
        name: "",
        message: "",
    },
    components: {
        tabs: VueStrap.tabs,
        tab: VueStrap.tab
    },
    watch: {
        myTipolList: function () {
            this.loadSpecificProcs();
        },
    },
    methods: {
        loadTipols: function () {
            let orgsToParse = [];
            let keys = ["id", "Tipo", "Nome", "Sigla"];

            this.$http.get("/api/organizacoes")
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    let completeList = this.parseList(orgsToParse, keys);

                    //tipologias
                    this.tipolList = completeList.filter(
                        a => (a.Tipo == "Tipologia")
                    ).map(function (item) {
                        return {
                            label: item.Sigla + " - " + item.Nome,
                            value: item,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });
                })
                .catch(function (error) {
                    console.error(error);
                });
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
        swap: function (array, pos1, pos2) {
            var temp = array[pos1];
            array[pos1] = array[pos2];
            array[pos2] = temp;

            return array;
        },
        loadSpecificProcs() {
            let content = [];

            this.$http.get("/api/classes")
            .then(function (response) {
                content = response.body;
            })
            .then(function () {
                this.parse(content, this.specificProcs);
                this.ready = true;
            })
            .catch(function (error) {
                console.error(error);
            });
        },  
        loadRestProcs() {
            let content = [];

            this.$http.get("/api/classes")
            .then(function (response) {
                content = response.body;
            })
            .then(function () {
                this.parse(content, this.restProcs);
                this.ready = true;
            })
            .catch(function (error) {
                console.error(error);
            });
        },
        selectClicked: function (params, struct) {
            var id = params.id;

            var path = id.split('.');
            this.selectTree(path, struct, !params.rowData.selected, params);
        },
        selectTree: function (indexes, location, selected, params) {
            if (indexes.length == 1) {
                this.selectSons(location[indexes[0]], selected, params);
            }
            else {
                if (selected) {
                    location[indexes[0]].selected = true;
                }

                //get the path tail
                var tail = indexes.splice(1, indexes.length - 1);

                //next level in the data structure
                var newLocation = location[indexes[0]].sublevel;

                this.selectTree(tail, newLocation, selected, params);
            }
        },
        selectSons: function (location, selected, params) {
            if(!selected){
                if(location.owner){
                    location.owner=false;
                }
                if(location.participant){
                    location.participant=false;
                }
            }

            location.selected = selected;
            var tempParams = null;

            if (location.sublevel && location.sublevel.length) {
                for (var i = 0; i < location.sublevel.length; i++) {
                    tempParams = JSON.parse(JSON.stringify(params));
                    tempParams.id += "." + i;

                    this.selectSons(location.sublevel[i], selected, tempParams);
                }
            }
            else if (location.sublevel && !location.sublevel.length) {
                this.dropClicked(params);
            }
        },
        dropClicked: function (params, struct) {
            var id = params.id;
            var ready = params.rowData.subReady;
            if (!ready) {
                //split the id; example: '1.1.2' becomes ['1','1','2']
                var path = id.split('.');
                this.loadSub(path, struct, params);
            }
        },
        loadSub: function (indexes, location, params) {
            if (indexes.length == 1) {
                this.$http.get("/api/classes/" + params.rowData.codeID + "/descendencia")
                    .then(function (response) {
                        this.subTemp = response.body;
                    })
                    .then(function () {
                        //load child classes on the sublevel of the parent
                        location[indexes[0]].sublevel = this.parseSub(location[indexes[0]].selected);

                        //if class is selected load every descendant
                        if (location[indexes[0]].selected) {
                            for (var i = 0; i < location[indexes[0]].sublevel.length; i++) {
                                if (location[indexes[0]].sublevel[i].sublevel && !location[indexes[0]].sublevel[i].sublevel.length) {
                                    tempParams = JSON.parse(JSON.stringify(params));
                                    tempParams.id += "." + i;
                                    tempParams.rowData.codeID = location[indexes[0]].sublevel[i].codeID;

                                    this.dropClicked(tempParams);
                                }
                            }
                        }

                        //let child components know that the rows are ready to render
                        location[indexes[0]].subReady = true;
                        this.nEdits++;
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            }
            else {
                //get the path tail
                var tail = indexes.splice(1, indexes.length - 1);

                //next level in the data structure
                var newLocation = location[indexes[0]].sublevel;

                this.loadSub(tail, newLocation, params);
            }
        },
        parse: function (dataToParse, destination) {
            // parsing the JSON
            for (var i = 0; i < dataToParse.length; i++) {
                var temp = {
                    content: "",
                    sublevel: false,
                    selected: false,
                    drop: false,
                    subReady: false,
                };

                var id = dataToParse[i].id.value.replace(/[^#]+#(.*)/, '$1');
                var code = dataToParse[i].Code.value;
                var title = dataToParse[i].Title.value;

                temp.content = [code, title];
                temp.codeID = id;

                if (dataToParse[i].NChilds.value > 0) {
                    temp.sublevel = true;
                }

                destination[i] = JSON.parse(JSON.stringify(temp));
            }
            destination.sort(function (a, b) {
                return a.content[0].localeCompare(b.content[0]);
            })
        },
        parseSub: function (selecValue) {
            var ret = []
            var temp = {
                content: "",
                sublevel: false,
                selected: selecValue,
                drop: false,
                subReady: false
            };

            // parsing the JSON
            for (var i = 0; i < this.subTemp.length; i++) {

                var id = this.subTemp[i].Child.value.replace(/[^#]+#(.*)/, '$1');
                var code = this.subTemp[i].Code.value;
                var title = this.subTemp[i].Title.value;

                temp.content = [code, title];
                temp.codeID = id;

                if (parseInt(this.subTemp[i].NChilds.value) > 0) {
                    temp.sublevel = true;
                }
                else {
                    temp.sublevel = false;
                }

                ret[i] = JSON.parse(JSON.stringify(temp));
            }

            ret.sort(function (a, b) {
                a1 = parseInt(a.content[0].replace(/([0-9]+\.)*([0-9]+)/, '$2'));
                b1 = parseInt(b.content[0].replace(/([0-9]+\.)*([0-9]+)/, '$2'));

                return a1 - b1;
            })

            return ret;
        },
        getSelected: function (location) {
            var list = [];

            for (var i = 0; i < location.length; i++) {
                //if a node is selected add its ID to the list and check its descendants
                if (location[i].selected) {
                    list.push(location[i].codeID);


                    if (location[i].sublevel && location[i].sublevel.length) {
                        list = list.concat(this.getSelected(location[i].sublevel));
                    }
                }
            }
            return list;
        },
        createSelTab: function () {
            var dataObj = {
                name: this.name,
                classes: this.getSelected(this.commonProcs),
            }

            if (dataObj.classes.length == 0) {
                this.message = "É necessário selecionar uma ou mais classes!";
            } else if (dataObj.name.length == 0) {
                this.message = "O campo 'Designação' não pode estar vazio!"
            } else {
                this.$http.post('/api/tabelasSelecao/', dataObj, {
                    headers: {
                        'content-type': 'application/json'
                    }
                })
                    .then(function (response) {
                        window.location.href = '/tabelaSelecao/consultar/' + response.body;
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            }
        },
        saveInfo: function () {
            let selected = {
                comuns: this.getSelected(this.commonProcs),
                especificos: this.getSelected(this.specificProcs),
                restantes: this.getSelected(this.restProcs),
            };

            /* do stuff */
        },
        loadInfo: function() {
            /* get info */
            /* apply info */ 
        }
    },
    created: function () {
        this.tableHeader = [
            "CLASSE",
            "TÍTULO"
        ];

        let content=[];

        this.$http.get("/api/classes")
            .then(function (response) {
                content = response.body;
            })
            .then(function () {
                this.parse(content, this.commonProcs);
                this.ready = true;

                this.loadTipols();
                this.loadRestProcs();
            })
            .catch(function (error) {
                console.error(error);
            });
    }
})
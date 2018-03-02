var escolha = new Vue({
    el: '#tabs',
    data: {
        entidade: {
            nome: "Teste",
        },
        newTipol: null,

        tipolsTableHeader: ["#", "Sigla", "Nome"],
        tipolsTableWidth: ["4%", "20%", "80%"],
        tipolList: [],
        myTipolList: [],
        tipolsReady: false,

        tableHeader: [],
        commonProcs: [],
        specificProcs: [],
        restProcs: [],
        ready: false,
        specReady: false,
        restReady: false,
        cwidth: ['16%', '81%'],
        subTemp: [],
        nEdits: 0,
        name: "",
        message: "",
        activeTab: 0,

        commonPNSelected: [],
        specPNSelected: [],
        restPNSelected: [],

        message: "",
        createConfirm: false, 
    },
    components: {
        tabs: VueStrap.tabs,
        tabGroup: VueStrap.tabGroup,
        tab: VueStrap.tab
    },
    methods: {
        tipolSelected: function (row) {
            if (!row.selected) {
                this.myTipolList.push(row.id);
            }
            else {
                let index = this.myTipolList.indexOf(row.id);
                if (index != -1) {
                    this.myTipolList.splice(index, 1);
                }
            }

            this.specPNSelected = this.getSelected(this.specificProcs);
            this.restPNSelected = this.getSelected(this.restProcs);

            this.specReady = false;
            this.restReady = false;
            if (this.myTipolList.length) {
                this.loadSpecificProcs();
            }
            else {
                this.specificProcs = [{ content: [000, "Nenhuma tipologia selecionada..."] }];
                this.specReady = false;
            }
            this.loadRestProcs();
        },
        inputed: function (event) {
            this.activeTab = event;
        },
        loadTipols: function () {
            this.tipolsReady = false;
            this.tipolList = [];
            
            let orgsToParse = [];
            let keys = ["id", "Tipo", "Nome", "Sigla"];

            this.$http.get("/api/organizacoes")
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    let completeList = this.parseList(orgsToParse, keys);
                    let i = 0;

                    let selection = this.myTipolList;
                    //tipologias
                    this.tipolList = completeList.filter(
                        a => (a.Tipo == "Tipologia")
                    ).map(function (item) {
                        return {
                            data: [i++, item.Sigla, item.Nome],
                            selected: selection.indexOf(item.id) != -1,
                            id: item.id
                        }
                    }).sort(function (a, b) {
                        return a.data[1].localeCompare(b.data[1]);
                    });

                    this.tipolsReady = true;
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
        loadCommonProcs() {
            this.ready=false;
            let content = [];

            this.$http.get("/api/classes/filtrar/comuns")
                .then(function (response) {
                    content = response.body;
                })
                .then(function () {

                    this.commonProcs = [];
                    this.parse(content, this.commonProcs, this.commonPNSelected);
                    this.ready = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadSpecificProcs() {
            let content = [];

            this.$http.get("/api/classes/filtrar/" + this.myTipolList.join(','))
                .then(function (response) {
                    content = response.body;
                })
                .then(function () {

                    this.specificProcs = [];
                    this.parse(content, this.specificProcs, this.specPNSelected);
                    this.specReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadRestProcs() {
            let content = [];

            this.$http.get("/api/classes/filtrar/restantes/" + this.myTipolList.join(','))
                .then(function (response) {
                    content = response.body;
                })
                .then(function () {

                    this.restProcs = [];
                    this.parse(content, this.restProcs, this.restPNSelected);
                    this.restReady = true;
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
            if (!selected) {
                if (location.owner) {
                    location.owner = false;
                }
                if (location.participant) {
                    location.participant = false;
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
        parse: function (dataToParse, destination, selectedPNs) {
            const indexes = {};
            let avo;
            let pai;

            for (let pn of dataToParse) {
                let codeAvo = pn.AvoCodigo.value;
                let indexesAvo = indexes[codeAvo];
                let codePai = pn.PaiCodigo.value;

                let pnSelected = (selectedPNs.indexOf(pn.PN.value.replace(/[^#]+#(.*)/, '$1')) != -1);


                if (indexesAvo) {
                    avo = indexesAvo.i;

                    if (indexesAvo.sub[codePai] != undefined) {
                        pai = indexesAvo.sub[codePai];
                    }
                    else {
                        pai = Object.keys(indexesAvo.sub).length;

                        indexes[codeAvo].sub[codePai] = pai;

                        let infoPai = {
                            codeID: pn.Pai.value.replace(/[^#]+#(.*)/, '$1'),
                            content: [codePai, pn.PaiTitulo.value],
                            drop: false,
                            selected: pnSelected,
                            subReady: true,
                            sublevel: []
                        }
                        destination[avo].sublevel.push(infoPai);
                    }
                }
                else {
                    avo = Object.keys(indexes).length;
                    pai = 0;

                    indexes[codeAvo] = { i: avo, sub: {} };
                    indexes[codeAvo].sub[codePai] = pai;

                    let infoAvo = {
                        codeID: pn.Avo.value.replace(/[^#]+#(.*)/, '$1'),
                        content: [codeAvo, pn.AvoTitulo.value],
                        drop: false,
                        selected: pnSelected,
                        subReady: true,
                        sublevel: [{
                            codeID: pn.Pai.value.replace(/[^#]+#(.*)/, '$1'),
                            content: [codePai, pn.PaiTitulo.value],
                            drop: false,
                            selected: pnSelected,
                            subReady: true,
                            sublevel: [],
                        }]
                    }
                    destination.push(infoAvo);
                }

                let pninfo = {
                    codeID: pn.PN.value.replace(/[^#]+#(.*)/, '$1'),
                    content: [pn.PNCodigo.value, pn.PNTitulo.value],
                    drop: false,
                    selected: pnSelected,
                }

                if (pn.Filhos.value.length) {
                    pninfo.subReady = true;
                    pninfo.sublevel = [];

                    for (let filho of pn.Filhos.value.split('###')) {
                        let filhoInfo = filho.split(':::');

                        pninfo.sublevel.push({
                            codeID: filhoInfo[0].replace(/[^#]+#(.*)/, '$1'),
                            content: [filhoInfo[1], filhoInfo[2]],
                            drop: false,
                            selected: pnSelected,
                        });
                    }
                }
                destination[avo].sublevel[pai].sublevel.push(pninfo);
            }
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
        getAllSelected: function () {
            var list = [];

            list = list.concat(this.getSelected(this.commonProcs))
                .concat(this.getSelected(this.specificProcs))
                .concat(this.getSelected(this.restProcs));

            return Array.from(new Set(list));
        },
        clean: function(i){
            if(i==0) {
                this.commonPNSelected=[];
                this.ready=false;
                this.loadCommonProcs();
            } 
            else if(i==1) {
                this.specPNSelected=[];
                this.specReady=false;
                this.loadSpecificProcs();
            }
            else if(i==2) {
                this.restPNSelected=[];
                this.restReady=false;
                this.loadRestProcs();
            }
            
        },
        saveInfo: function () {
            let selected = {
                tipologias: this.myTipolList,
                comuns: this.getSelected(this.commonProcs),
                especificos: this.getSelected(this.specificProcs),
                restantes: this.getSelected(this.restProcs),
            };

            this.$http.put('/users/save/escolhaProcessos', selected, {
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(function (response) {
                    var resp = response.body;
                    console.log(resp);
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadSavedInfo: function () {
            this.$http.get("/users/load/escolhaProcessos")
                .then(function (response) {
                    content = response.body;
                })
                .then(function(){
                    console.log(content);

                    this.commonPNSelected=content.comuns;
                    this.ready=false;
                    this.loadCommonProcs();
                    
                    this.myTipolList=content.tipologias;
                    this.tipolsReady=false;
                    this.loadTipols();

                    this.specPNSelected=content.especificos;
                    this.specReady=false;
                    this.loadSpecificProcs();

                    this.restPNSelected=content.restantes;
                    this.restReady=false;
                    this.loadRestProcs();
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        createSelTab: function (force) {
            let ok=force;

            if(!ok){
                this.message="";
                ok=true;
                if(this.getSelected(this.commonProcs).length==0){
                    this.message += "<p>Nenhum processo comum selecionado!</p>";
                    ok=false;
                }
                if(this.getSelected(this.specificProcs).length==0){
                    this.message += "<p>Nenhum processo específico selecionado!</p>";
                    ok=false;
                }
                if(this.getSelected(this.restPNSelected).length==0){
                    this.message += "<p>Nenhum processo restante selecionado!</p>";
                    ok=false;
                }
                if(!ok){
                    this.message += "<p>Continuar mesmo assim?</p>"
                }
                this.createConfirm=true;
            }

            if(ok){
                var dataObj = {
                    name: this.entidade.nome,
                    classes: this.getAllSelected(this.tableData),
                }

                if (dataObj.classes.length == 0) {
                    this.message = "É necessário selecionar um ou mais processos!";
                    this.createConfirm=false;
                }
                else {
                    this.message="<p>A criar tabela de seleção!</p><p> Será redirecionado para a respectiva página após a criação.</p>";
                    this.$http.post('/api/tabelasSelecao/', dataObj, {
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                        .then(function (response) {
                            window.location.href = '/tabelasSelecao/consultar/' + response.body;
                        })
                        .catch(function (error) {
                            console.error(error);
                        });
                }
            }
        }
    },
    created: function () {
        this.tableHeader = [
            "CLASSE",
            "TÍTULO"
        ];

        this.loadCommonProcs();
        this.loadTipols();
        this.loadRestProcs();
        
    }
})
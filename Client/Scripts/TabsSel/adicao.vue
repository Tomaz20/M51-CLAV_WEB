var selecao = new Vue({
    el: '#selecao',
    data: {
        tableHeader: [],
        tableData: [],
        ready: false,
        content: [],
        cwidth: ['15%', '81%'],
        subTemp: [],
        nEdits: 0,
        name: "",
        message: "",
    },
    methods: {
        swap: function (array, pos1, pos2) {
            var temp = array[pos1];
            array[pos1] = array[pos2];
            array[pos2] = temp;

            return array;
        },
        selectClicked: function (params) {
            var id = params.id;

            var path = id.split('.');
            this.selectTree(path, this.tableData, !params.rowData.selected, params);
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
        dropClicked: function (params) {
            var id = params.id;
            var ready = params.rowData.subReady;

            if (!ready) {
                //split the id; example: '1.1.2' becomes ['1','1','2']
                var path = id.split('.');
                this.loadSub(path, this.tableData, params);
            }
        },
        loadSub: function (indexes, location, params) {
            if (indexes.length == 1) {
                this.$http.get("/childClasses?parent=" + params.rowData.codeID)
                    .then(function (response) {
                        this.subTemp = response.body;
                    })
                    .then(function () {
                        //load child classes on the sublevel of the parent
                        location[indexes[0]].sublevel = this.parseSub(location[indexes[0]].selected);

                        //if class is selected load every all descendants
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
        rowClicked: function (params) {
            window.location.href = '/classe?id=c' + params.rowData[0];
        },
        parse: function () {
            // parsing the JSON
            for (var i = 0; i < this.content.length; i++) {
                var temp = {
                    content: "",
                    sublevel: false,
                    selected: false,
                    drop: false,
                    subReady: false,
                };

                var id = this.content[i].id.value.replace(/[^#]+#(.*)/, '$1');
                var code = this.content[i].Code.value;
                var title = this.content[i].Title.value;

                temp.content = [code, title];
                temp.codeID = id;

                if (this.content[i].NChilds.value > 0) {
                    temp.sublevel = true;
                }

                this.tableData[i] = JSON.parse(JSON.stringify(temp));
            }
            this.tableData.sort(function (a, b) {
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
                classes: this.getSelected(this.tableData),
            }

            this.$http.post('/createSelTab',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then( function(response) { 
                window.location.href = '/tabelaSelecao?table='+response.body;
            })
            .catch( function(error) { 
                console.error(error); 
            });


        }

    },
    created: function () {
        this.tableHeader = [
            "CLASSE",
            "TÍTULO"
        ];

        this.$http.get("/classesn")
            .then(function (response) {
                this.content = response.body;
            })
            .then(function () {
                this.parse();
                this.ready = true;
            })
            .catch(function (error) {
                console.error(error);
            });
    }
})
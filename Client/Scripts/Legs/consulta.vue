var leg = new Vue({
    el: '#legislacao-form',
    data: {
        id: "",
        legData : {
            year: {
                label: "Ano",
                original: "",
                new: "",
                edit: false
            },
            date: {
                label: "Data",
                original: "",
                new: "",
                edit: false
            },
            number: {
                label: "Número",
                original: "",
                new: "",
                edit: false
            },
            type: {
                label: "Tipo",
                original: "",
                new: "",
                edit: false
            },
            title: {
                label: "Título",
                original: "",
                new: "",
                edit: false
            },
            link: {
                label: "Link",
                original: "",
                new: "",
                edit: false
            },
        },
        content: [],
        message: "",
        updateReady: false,
        delConfirm: false,
        ready: false,

        classList:[],
        processes: [],
        newProcess: "",
        newProcesses: [],
        editProcesses: false,
        processesCollapsed: true,
        processesReady: false,
    },
    methods: {
        getParameterByName: function(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        loadClasses: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/classesn?level=3")
                .then(function (response) {
                    classesToParse = response.body;
                })
                .then(function () {
                    this.classList = this.parseList(classesToParse, keys).map(function(item){
                        return {
                            label: item.Code+" - "+item.Title,
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
        loadProcesses: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/procsLeg?id=" + this.id)
                .then(function (response) {
                    classesToParse = response.body;
                })
                .then(function () {
                    this.processes = JSON.parse(JSON.stringify(this.parseList(classesToParse, keys)));
                    this.newProcesses = JSON.parse(JSON.stringify(this.parseList(classesToParse, keys)));

                    this.processesReady = true;
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
                }

                dest[i] = JSON.parse(JSON.stringify(temp));
            }

            return dest.sort(function (a, b) {
                return a.id.localeCompare(b.id);
            });
        },   
        parse: function(){    
            this.legData.year.original=this.content[0].Ano.value;
            this.legData.date.original=this.content[0].Data.value;
            this.legData.number.original=this.content[0].Número.value;
            this.legData.type.original=this.content[0].Tipo.value;
            this.legData.title.original=this.content[0].Titulo.value;
            this.legData.link.original=this.content[0].Link.value;
        
            this.ready=true;
        },
        update: function(){
            var dataObj = {
                id: this.id,
                year: null,
                date: null,
                number: null,
                type: null,
                title: null,
                link: null,
            };

            keys=Object.keys(this.legData);

            for(var i=0;i<keys.length;i++){
                if(this.legData[keys[i]].edit && this.legData[keys[i]].new){
                    dataObj[keys[i]]=this.legData[keys[i]].new;
                }
            }

            this.$http.put('/updateLeg',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then( function(response) { 
                this.message = response.body;
            })
            .catch( function(error) { 
                console.error(error); 
            });
        },
        delReady: function(){
            this.message="Tem a certeza que deseja apagar?";
            this.delConfirm=true;
        },
        delNotReady: function(){
            this.message= "";
            this.delConfirm=false;
        },
        deleteLeg: function(){
            this.$http.post('/deleteLeg',{id: this.id})
            .then( function(response) { 
                this.message = response.body;
                window.location.href = '/legislacoes';
            })
            .catch( function(error) { 
                console.error(error); 
            });
        } 
    },
    created: function(){
        this.id=this.getParameterByName('id');

        this.$http.get("/singleLeg?id="+this.id)
        .then( function(response) { 
            this.content = response.body;
        })
        .then( function() {
            this.parse();
            this.loadProcesses();
        })
        .catch( function(error) { 
            console.error(error); 
        });
    }
})
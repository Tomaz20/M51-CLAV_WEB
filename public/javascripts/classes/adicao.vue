new Vue({
    el: '#nova-classe-form',
    http: {
        emulateJSON: true,
        emulateHTTP: true
    },
    data: {
        type: 1,

        parent: null,
        parents: null,
        parentsReady: false,

        code: null,
        
        title: null,
        
        newOwner: null,
        ownerList: [],
        orgList: null,
        orgsReady: false,
        
        newLegislation: null,
        newLegList: [],
        legList: null,
        legsReady: false,
        
        description: null,
        
        newExAppNote: null,
        exAppNotes: [],
        
        newAppNote: null,
        appNotes: [],
        
        newDelNote: null,
        delNotes: [],
        
        status: "H",
        
        procType: null,

        procTrans: null,

        newParticipantType: null,
        newParticipant: null,
        participants: {
            Apreciador: [],
            Assessor: [],
            Comunicador: [],
            Decisor: [],
            Executor: [],
            Iniciador: [],
        },

        newRelType: null,
        newRelProc: null,
        relProcs: {
            'Antecessor De': [],
            'Complementar De': [],
            'Cruzado Com': [],
            'Sintese De': [],
            'Sintetizado Por': [],
            'Sucessor De': [],
            'Suplemento De': [],
            'Suplemento Para': [],
        },
        classList: null,
        classesReady: false,

        message: null,

        parentvalue: "",
    },
    watch: {
        parentvalue: function(){
            this.parent=this.parentvalue.value;
        },
        parent: function () {
            this.code = this.parent.slice(1, this.parent.length)+".";
        },
        type: function () {
            this.parent = "";
            if (this.type > 1) {
                this.loadParents();
            }
        },
        code: function () {
            if(this.type>1){
                if(this.code.indexOf(this.parent.slice(1, this.parent.length)) != 0){
                    this.code=this.parent.slice(1, this.parent.length)+".";
                }
                if(this.code[this.parent.length-1]!='.'){
                    this.code=this.parent.slice(1, this.parent.length)+".";   
                }
            }
        }
    },
    methods: {
        loadClasses: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/api/classes/level=3")
                .then(function (response) {
                    classesToParse = response.body;
                })
                .then(function () {
                    this.classList = this.parse(classesToParse, keys)
                    .map(function(item){
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
        loadOrgs: function () {
            var orgsToParse = [];
            var keys = ["id", "Sigla", "Nome"];

            this.$http.get("/api/orgs")
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    this.orgList = this.parse(orgsToParse, keys)
                    .map(function(item){
                        return {
                            label: item.Sigla+" - "+item.Nome,
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
        loadLegs: function () {
            var legsToParse = [];
            var keys = ["id", "Número", "Titulo", "Tipo"];

            this.$http.get("/api/leg")
                .then(function (response) {
                    legsToParse = response.body;
                })
                .then(function () {
                    this.legList = this.parse(legsToParse, keys)
                    .map(function(item){
                        return {
                            label: item.Tipo+" - "+item.Número,
                            value: item,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });
                    this.legsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadParents: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/api/classes/level=" + (this.type - 1))
                .then(function (response) {
                    classesToParse = response.body;
                })
                .then(function () {
                    this.parents = this.parse(classesToParse, keys)
                    .map(function(item){
                        return {
                            label: item.Code+" - "+item.Title,
                            value: item.id,
                        }
                    }).sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });
                    this.parentsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        parse: function (content, keys) {
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

            return dest;
        },
        addNewExAppNote: function () {
            if (this.newExAppNote) {
                this.exAppNotes.push(this.newExAppNote);
                this.newExAppNote = '';
            }
        },
        addNewAppNote: function () {
            if (this.newAppNote) {
                this.appNotes.push({
                    id: "",
                    Note: this.newAppNote
                });
                this.newAppNote = '';
            }
        },
        addNewDelNote: function () {
            if (this.newDelNote) {
                this.delNotes.push({
                    id: "",
                    Note: this.newDelNote
                });
                this.newDelNote = '';
            }
        },
        checkready: function (dataObj){
            if(!this.code.match(/^([0-9]+\.)*[0-9]+$/)){
                this.message="Formato do código errado!";
                return false;
            }

            if(this.type==1){
                if(this.code && this.title){
                    dataObj = {
                        Level: this.type,               //
                        Parent: null,                   //
                        Code: this.code,                //
                        Title: this.title,              //
                        Description: this.description,  //
                        AppNotes: this.appNotes,        //
                        ExAppNotes: this.exAppNotes,    //
                        DelNotes: this.delNotes,        //
                        Type: null,                     //
                        Trans: null,                    //
                        Owners: null,                   //
                        Participants: null,             //
                        RelProcs: null,                 //
                        Status: this.status,            //
                        Legislations: null,             //
                    };

                    return dataObj;
                }
                else{
                    this.message="Preencher campos obrigatórios!";
                    return false;
                }
            }
            else{
                if(this.parent && this.code && this.title){
                    if(this.type==3){
                        if(this.procTrans=='S'){
                            var keys = Object.keys(this.participants);
                            var check=0;

                            for (var k = 0; k < keys.length; k++) {
                                check+=this.participants[keys[k]].length;
                            }

                            if(check==0){
                                this.message="Um processo transversal tem de ter pelo menos um participante!";
                                return false;
                            }
                            else{
                                dataObj = {
                                    Level: this.type,               //
                                    Parent: this.parent,            //
                                    Code: this.code,                //
                                    Title: this.title,              //
                                    Description: this.description,  //
                                    AppNotes: this.appNotes,        //
                                    ExAppNotes: this.exAppNotes,    //
                                    DelNotes: this.delNotes,        //
                                    Type: this.procType,            //
                                    Trans: this.procTrans,          //
                                    Owners: this.ownerList,         //
                                    Participants: this.participants,//
                                    RelProcs: this.relProcs,        //
                                    Status: this.status,            //
                                    Legislations: this.newLegList,  //
                                };

                                return dataObj;
                            }
                        }
                        else{
                            dataObj = {
                                Level: this.type,               //
                                Parent: this.parent,            //
                                Code: this.code,                //
                                Title: this.title,              //
                                Description: this.description,  //
                                AppNotes: this.appNotes,        //
                                ExAppNotes: this.exAppNotes,    //
                                DelNotes: this.delNotes,        //
                                Type: this.procType,            //
                                Trans: this.procTrans,          //
                                Owners: this.ownerList,         //
                                Participants: null,             //
                                RelProcs: this.relProcs,        //
                                Status: this.status,            //
                                Legislations: this.newLegList,  //
                            };

                            return dataObj;
                        }
                    }
                    else {
                        dataObj = {
                            Level: this.type,               //
                            Parent: this.parent,            //
                            Code: this.code,                //
                            Title: this.title,              //
                            Description: this.description,  //
                            AppNotes: this.appNotes,        //
                            ExAppNotes: this.exAppNotes,    //
                            DelNotes: this.delNotes,        //
                            Type: null,                     //
                            Trans: null,                    //
                            Owners: null,                   //
                            Participants: null,             //
                            RelProcs: null,                 //
                            Status: this.status,            //
                            Legislations: null,             //
                        };

                        return dataObj;
                    }
                }
                else{
                    this.message="Preencher campos obrigatórios!";
                    return false;
                }
            }
        },
        add: function () {

            if(this.appNotes){
                for (var i = 0; i < this.appNotes.length; i++) {
                    this.appNotes[i].id = "na_c" + this.code + "_" + (i + 1);
                }
            }
            
            if(this.delNotes){
                for (var i = 0; i < this.delNotes.length; i++) {
                    this.delNotes[i].id = "ne_c" + this.code + "_" + (i + 1);
                }
            }

            var dataObj = {
                Level: null,        //
                Parent: null,       //
                Code: null,         //
                Title: null,        //
                Description: null,  //
                AppNotes: null,     //
                ExAppNotes: null,   //
                DelNotes: null,     //
                Type: null,         //
                Trans: null,        //
                Owners: null,       //
                Participants: null, //
                RelProcs: null,     //
                Status: null,       //
                Legislations: null, //
            };

            if(dataObj=this.checkready(dataObj)){        
                
                this.$http.post('/api/classes/create',dataObj,{
                    headers: {
                        'content-type' : 'application/json'
                    }
                })
                .then( function(response) { 
                    this.message = response.body;
                    
                    if(response.body=="Classe Inserida!"){
                        window.location.href = '/classes/consulta/c'+this.code;
                    }
                })
                .catch( function(error) { 
                    console.error(error); 
                });
            }
        }
    },
    created: function () {
        this.loadOrgs();
        this.loadLegs();
        this.loadClasses();
    }
})
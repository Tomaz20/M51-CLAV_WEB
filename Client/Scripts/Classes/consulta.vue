new Vue({
    el: '#classe-form',
    data: {
        message: "",
        delConfirm: false,
        id: "",
        orgList: [],
        orgListTest: [],
        legList: [],
        classList: [],
        clas: {
            Title: "",
            Code: "",
            Parent: {
                id: "",
                code: "",
                title: "",
            },
            Status: "",
            Desc: "",
            ProcType: "",
            ProcTrans: "",
            Owners: [],
            Legs: [],
            AppNotes: [],
            DelNotes: [],
            RelProcs: [],
            Participants: [],
        },
        newClass: {
            Title: "",
            Status: "",
            Desc: "",
            ProcType: "",
            ProcTrans: "",
            Owner: "",
            Owners: [],
            Leg: "",
            Legs: [],
            ExAppNote: "",
            ExAppNotes: [],
            AppNote: "",
            AppNotes: [],
            DelNote: "",
            DelNotes: [],
            RelProc: "",
            RelType: "",
            RelProcs: [],
            Participant: "",
            ParticipantType: "",
            Participants: [],
        },
        edit: {
            Title: false,
            Status: false,
            Desc: false,
            ProcType: false,
            ProcTrans: false,
            Owners: false,
            Legs: false,
            ExAppNotes: false,
            AppNotes: false,
            DelNotes: false,
            RelProcs: false,
            Participants: false,
        },
        orgsReady: false,
        ownersReady: false,
        legListReady: false,
        legsReady: false,
        exAppNotesReady: false,
        appNotesReady: false,
        delNotesReady: false,
        classesReady: false,
        relProcsReady: false,
        pageReady: false,
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
        loadOrgs: function () {
            var orgsToParse = [];
            var keys = ["id", "Sigla", "Nome"];

            this.$http.get("/orgs")
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
        loadOwners: function () {
            var orgsToParse = [];
            var keys = ["id", "Sigla", "Nome"];

            this.$http.get("/ownersClass?id=" + this.id)
                .then(function (response) {
                    orgsToParse = response.body;
                })
                .then(function () {
                    this.clas.Owners = JSON.parse(JSON.stringify(this.parse(orgsToParse, keys)));
                    this.newClass.Owners = JSON.parse(JSON.stringify(this.parse(orgsToParse, keys)));


                    this.ownersReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadLegList: function () {
            var legsToParse = [];
            var keys = ["id","Tipo", "Número", "Titulo"];

            this.$http.get("/legs")
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
                    
                    this.legListReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadLegs: function () {
            var legsToParse = [];
            var keys = ["id","Tipo", "Número", "Titulo"];

            this.$http.get("/legsClass?id=" + this.id)
                .then(function (response) {
                    legsToParse = response.body;
                })
                .then(function () {
                    this.clas.Legs = JSON.parse(JSON.stringify(this.parse(legsToParse, keys)));
                    this.newClass.Legs = JSON.parse(JSON.stringify(this.parse(legsToParse, keys)));

                    this.legsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadAppNotes: function () {
            var notesToParse = [];
            var keys = ["id", "Nota"];

            this.$http.get("/appNotesClass?id=" + this.id)
                .then(function (response) {
                    notesToParse = response.body;
                })
                .then(function () {
                    this.clas.AppNotes = JSON.parse(JSON.stringify(this.parse(notesToParse, keys)));
                    this.newClass.AppNotes = JSON.parse(JSON.stringify(this.parse(notesToParse, keys)));

                    this.appNotesReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadDelNotes: function () {
            var notesToParse = [];
            var keys = ["id", "Nota"];

            this.$http.get("/delNotesClass?id=" + this.id)
                .then(function (response) {
                    notesToParse = response.body;
                })
                .then(function () {
                    this.clas.DelNotes = JSON.parse(JSON.stringify(this.parse(notesToParse, keys)));
                    this.newClass.DelNotes = JSON.parse(JSON.stringify(this.parse(notesToParse, keys)));

                    this.delNotesReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadExAppNotes: function () {
            var notesToParse = [];
            var keys = ["Exemplo"];

            this.$http.get("/exAppNotesClass?id=" + this.id)
                .then(function (response) {
                    notesToParse = response.body;
                })
                .then(function () {
                    this.clas.ExAppNotes = JSON.parse(JSON.stringify(this.parse(notesToParse, keys)));
                    this.newClass.ExAppNotes = JSON.parse(JSON.stringify(this.parse(notesToParse, keys)));

                    this.exAppNotesReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        loadClasses: function () {
            var classesToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/classesn?level=3")
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
        loadRelProcs: function () {
            var relProcsToParse = [];
            var keys = ["id", "Code", "Title"];

            this.$http.get("/relProcsClass?id=" + this.id)
                .then(function (response) {
                    relProcsToParse = response.body;
                })
                .then(function () {
                    this.clas.RelProcs = JSON.parse(JSON.stringify(this.parseRelations(relProcsToParse, keys)));
                    this.newClass.RelProcs = JSON.parse(JSON.stringify(this.parseRelations(relProcsToParse, keys)));

                    this.relProcsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
                });
        },       
        parseRelations: function (content, keys) {
            var dest = {
                'Antecessor De': [],
                'Complementar De': [],
                'Cruzado Com': [],
                'Sintese De': [],
                'Sintetizado Por': [],
                'Sucessor De': [],
                'Suplemento De': [],
                'Suplemento Para': []
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
                var type = content[i].Type.value.replace(/.*#e(.*)/, '$1').replace(/([a-z])([A-Z])/, '$1 $2');
                
                dest[type].push(JSON.parse(JSON.stringify(temp)));
            }

            return dest;
        },
        loadParticipants: function () {
            var participantsToParse = [];
            var keys = ['id', 'Nome', 'Sigla'];

            this.$http.get("/participantsClass?id=" + this.id)
                .then(function (response) {
                    participantsToParse = response.body;
                })
                .then(function () {
                    this.clas.Participants = this.parseParticipants(participantsToParse, keys);
                    this.newClass.Participants = JSON.parse(JSON.stringify(this.clas.Participants));

                    this.participantsReady = true;
                })
                .catch(function (error) {
                    console.error(error);
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

            return dest;
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
        prepData: function (dataObj) {
            this.clas.Title = dataObj.Titulo.value;
            this.clas.Code = dataObj.Codigo.value;

            console.log()

            if (dataObj.Pai) {
                this.clas.Parent.id = dataObj.Pai.value.replace(/[^#]+#(.*)/, '$1');
                this.clas.Parent.code = dataObj.CodigoPai.value;
                this.clas.Parent.title = dataObj.TituloPai.value;
            }
            if (dataObj.Status) {
                this.clas.Status = dataObj.Status.value;
                this.newClass.Status = dataObj.Status.value;
            }
            if (dataObj.Desc) {
                this.clas.Desc = dataObj.Desc.value;
                this.newClass.Desc = dataObj.Desc.value;
            }
            if (dataObj.ProcTipo) {
                this.clas.ProcType = dataObj.ProcTipo.value;
                this.newClass.ProcType = dataObj.ProcTipo.value;
            }
            if (dataObj.ProcTrans) {
                this.clas.ProcTrans = dataObj.ProcTrans.value;
                this.newClass.ProcTrans = dataObj.ProcTrans.value;
            }

            this.loadOwners();
            this.loadOrgs();

            this.loadLegs();
            this.loadLegList();

            this.loadExAppNotes();
            this.loadAppNotes();
            this.loadDelNotes();

            this.loadClasses();
            this.loadRelProcs();

            this.loadParticipants();
        },
        remOwner: function (index) {
            this.newClass.Owners.splice(index, 1);
        },
        addLeg: function (leg) {
            this.newClass.Legs.push(leg);
        },
        remLeg: function (index) {
            this.legList.push(this.newClass.Legs[index]);
            this.newClass.Legs.splice(index, 1);
        },
        addNewExAppNote: function () {
            if (this.newClass.ExAppNote) {
                this.newClass.ExAppNotes.push({ Exemplo: this.newClass.ExAppNote });
                this.newClass.ExAppNote = '';
            }
        },
        addNewAppNote: function () {
            function checkID(id, list) {
                for(var i=0;i<list.length;i++){
                    if(id==list[i].id.replace(/na_.*_([0-9])/, '$1')){
                        return false;
                    }
                }
                return true;
            }

            var newID = 1;
            if(this.clas.AppNotes && this.clas.AppNotes.length){
                for (var i = 0; i < this.clas.AppNotes.length; i++) {
                    var appID = parseInt(this.clas.AppNotes[i].id.replace(/na_.*_([0-9])/, '$1'));

                    if (newID !=appID){
                        if(checkID(newID,this.newClass.AppNotes)){
                            break;
                        }
                    }
                    newID++;
                }
                while(!checkID(newID,this.newClass.AppNotes)){
                    newID++;
                }
            } else {
                newID= this.newClass.AppNotes.length+1;
            }

            if (this.newClass.AppNote) {
                this.newClass.AppNotes.push({
                    id: "na_"+this.id+"_"+newID,
                    Nota: this.newClass.AppNote 
                });
                this.newClass.AppNote = '';
            }
        },
        addNewDelNote: function () {
            function checkID(id, list) {
                for(var i=0;i<list.length;i++){
                    if(id==list[i].id.replace(/ne_.*_([0-9])/, '$1')){
                        return false;
                    }
                }
                return true;
            }

            var newID=1;
            if(this.clas.DelNotes && this.clas.DelNotes.length){
                for (var i = 0; i < this.clas.DelNotes.length; i++) {
                    var delID = parseInt(this.clas.DelNotes[i].id.replace(/ne_.*_([0-9])/, '$1'));
                    
                    if (newID !=delID){
                        if(checkID(newID,this.newClass.DelNotes)){
                            break;
                        }
                    }
                    newID++;
                }
                while(!checkID(newID,this.newClass.DelNotes)){
                    newID++;
                }
            } else {
                newID=this.newClass.DelNotes.length+1;
            }
            
            if (this.newClass.DelNote) {
                this.newClass.DelNotes.push({
                    id: "ne_"+this.id+"_"+newID,
                    Nota: this.newClass.DelNote 
                });
                this.newClass.DelNote = '';
            }
        },
        addParticipant: function (type,participant) {
            this.newClass.Participants[type].push(participant);
        },
        remParticipant: function (key, index) {
            this.newClass.Participants[key].splice(index, 1);
        },
        addRelation: function (type,relation) {
            this.newClass.RelProcs[type].push(relation);
        },
        remRelation: function (key, index) {
            this.newClass.RelProcs[key].splice(index, 1);
        },
        addRelProc: function (proc) {
            this.newClass.RelProcs.push(proc);
        },
        remRelProc: function (index) {
            this.newClass.RelProcs.splice(index, 1);
        },
        readyToUpdate: function () {
            var keys = Object.keys(this.edit);

            for (var i = 0; i < keys.length; i++) {
                if (this.edit[keys[i]] && this.newClass[keys[i]] != this.clas[keys[i]]) {
                    return true;
                }
            }

            if (this.edit.Participants) {
                var keys = Object.keys(this.clas.Participants);

                for (var i = 0; i < keys.length; i++) {
                    if (this.newClass.Participants[keys[i]] != this.clas.Participants[keys[i]]) {
                        return true;
                    }
                }
            }

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
        updateClass: function () {
            this.message = "Updating...";

            var dataObj = {
                id: this.id,
                Title: null,
                Status: null,
                Desc: null,
                ProcType: null,
                ProcTrans: null,
                Owners: {
                    Add: null,
                    Delete: null,
                },
                Legs: {
                    Add: null,
                    Delete: null,
                },
                ExAppNotes: null,
                AppNotes: {
                    Add: null,
                    Delete: null,
                },
                DelNotes: {
                    Add: null,
                    Delete: null,
                },
                RelProcs: {
                    'Antecessor De': {
                        Add: null,
                        Delete: null,
                    },
                    'Complementar De': {
                        Add: null,
                        Delete: null,
                    },
                    'Cruzado Com': {
                        Add: null,
                        Delete: null,
                    },
                    'Sintese De': {
                        Add: null,
                        Delete: null,
                    },
                    'Sintetizado Por': {
                        Add: null,
                        Delete: null,
                    },
                    'Sucessor De': {
                        Add: null,
                        Delete: null,
                    },
                    'Suplemento De': {
                        Add: null,
                        Delete: null,
                    },
                    'Suplemento Para': {
                        Add: null,
                        Delete: null,
                    },
                },
                Participants: {
                    Apreciador: {
                        Add: null,
                        Delete: null,
                    },
                    Assessor: {
                        Add: null,
                        Delete: null,
                    },
                    Comunicador: {
                        Add: null,
                        Delete: null,
                    },
                    Decisor: {
                        Add: null,
                        Delete: null,
                    },
                    Executor: {
                        Add: null,
                        Delete: null,
                    },
                    Iniciador: {
                        Add: null,
                        Delete: null,
                    },
                }
            };

            var keys = ["Title", "Status", "Desc", "ProcType", "ProcTrans", "ExAppNotes"];

            for (var i = 0; i < keys.length; i++) {
                if (this.edit[keys[i]]) {
                    dataObj[keys[i]] = this.newClass[keys[i]];
                }
            }

            var arraysKeys = ["Owners", "Legs", "AppNotes", "DelNotes"];

            for (var i = 0; i < arraysKeys.length; i++) {
                if (this.edit[arraysKeys[i]]) {

                    var temp = {
                        Add: null,
                        Delete: null,
                    };

                    temp.Add = this.subtractArray(this.newClass[arraysKeys[i]], this.clas[arraysKeys[i]]);
                    temp.Delete = this.subtractArray(this.clas[arraysKeys[i]], this.newClass[arraysKeys[i]]);

                    dataObj[arraysKeys[i]] = JSON.parse(JSON.stringify(temp));
                }
            }

            var participantKeys = ["Apreciador", "Assessor", "Comunicador", "Decisor", "Executor", "Iniciador"];

            if (this.edit.Participants) {
                for (var i = 0; i < participantKeys.length; i++) {

                    var temp = {
                        Add: null,
                        Delete: null,
                    };

                    temp.Add = this.subtractArray(this.newClass.Participants[participantKeys[i]], this.clas.Participants[participantKeys[i]]);
                    temp.Delete = this.subtractArray(this.clas.Participants[participantKeys[i]], this.newClass.Participants[participantKeys[i]]);

                    dataObj.Participants[participantKeys[i]] = JSON.parse(JSON.stringify(temp));
                }
            }

            var relationKeys = Object.keys(this.clas.RelProcs);
            
            if (this.edit.RelProcs) {
                for (var i = 0; i < relationKeys.length; i++) {

                    var temp = {
                        Add: null,
                        Delete: null,
                    };

                    temp.Add = this.subtractArray(this.newClass.RelProcs[relationKeys[i]], this.clas.RelProcs[relationKeys[i]]);
                    temp.Delete = this.subtractArray(this.clas.RelProcs[relationKeys[i]], this.newClass.RelProcs[relationKeys[i]]);

                    dataObj.RelProcs[relationKeys[i]] = JSON.parse(JSON.stringify(temp));
                }
            }
            console.log(dataObj);

            this.$http.put('/updateClass?id='+this.id, { dataObj: dataObj },{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then(function (response) {
                this.message = response.body;
                window.location.href = '/classe?id='+this.id;
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
        deleteClass: function () {    
            this.$http.post('/deleteClass',{id: this.id})
            .then( function(response) { 
                this.message = response.body;
                window.location.href = '/classes';
            })
            .catch( function(error) { 
                console.error(error); 
            });
        }
    },
    created: function () {
        this.id = this.getParameterByName('id');
        this.clas.Level = this.id.split('.').length;

        var content;

        this.$http.get("/singleClass?id=" + this.id)
            .then(function (response) {
                content = response.body;
            })
            .then(function () {
                this.prepData(content[0]);
                this.pageReady=true;
            })
            .catch(function (error) {
                console.error(error);
            });
    }
})
new Vue({
    el: '#organizacao-form',
    data: {
        id: "",
        orgName: "",
        newName: "",
        editName: false,
        orgInitials: "",
        newInitials: "",
        editInitials: false,
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
        parse: function () {
            this.orgName = this.content[0].Nome.value;
            this.orgInitials = this.content[0].Sigla.value;
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
            var dataObj={
                id: this.id,
                name: null,
                initials: null,
            }

            if (this.editName && this.newName) {
                dataObj.name=this.newName;
            }
            if (this.editInitials && this.newInitials) {
                dataObj.initials=this.newInitials;
            }

            this.$http.put('/updateOrg',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then(function (response) {
                this.message = response.body;
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
            this.$http.post('/deleteOrg',{id: this.id})
            .then( function(response) { 
                this.message = response.body;
                window.location.href = '/organizacoes';
            })
            .catch( function(error) { 
                console.error(error); 
            });
        }
    },
    created: function () {
        this.id = this.getParameterByName('id');

        this.$http.get("/singleOrg?id=" + this.id)
            .then(function (response) {
                this.content = response.body;
            })
            .then(function () {
                this.loadDomain();
                this.loadParticipations();
                this.loadClasses();
                this.parse();
            })
            .catch(function (error) {
                console.error(error);
            });
    }
})
new Vue({
    el: '#tabela-organizacoes',
    data: {
        tableHeader: [],
        tableData: [[]],
        ready: false,
        content: [],
        cwidth: ['4%','75%','8%','13%'],
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
        rowClicked: function(row){
            var id = this.content[row[0]-1].id.value;
            id = id.replace(/[^#]+#(.*)/,'$1');
            
            window.location.href = '/organizacao?id='+id+'&type='+row[3];
        },
        addOrg: function(row){
            window.location.href = '/novaorganizacao';
        },
        parse: function(){    
            // key names for table header and parsing
            var keys=["Nome","Sigla","Tipo"];
            // setting the table header
            this.tableHeader=["#"].concat(keys);

            var temp=[];

            // parsing the JSON
            for (var i=0; i<this.content.length; i++) {
                temp[0]=i+1;

                for (var j=0; j<keys.length; j++){
                    temp[j+1] = this.content[i][keys[j]].value;
                }
                
                this.tableData[i]=temp.slice();

            }
            
            conj = new RegExp("#Conjunto", "g");
            tipol = new RegExp("#Tipologia", "g");

            this.tableData.map( function(row){
                if (conj.test(row[3])){
                    row[3]="Conjunto";
                }
                else if (tipol.test(row[3])){
                    row[3]="Tipologia";
                }
                else {
                    row[3]="Organização";
                }
                return row;
            })
            
        }
    },
    created: function(){
        this.$http.get("/orgs")
        .then( function(response) { 
            this.content = response.body;
        })
        .then( function() {
            this.parse();
            this.ready=true;
        })
        .catch( function(error) { 
            console.error(error); 
        });
    }
})
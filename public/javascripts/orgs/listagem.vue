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
        rowClicked: function(row){
            var id = this.content[row[0]-1].id.value;
            id = id.replace(/[^#]+#(.*)/,'$1');
            
            window.location.href = '/organizacoes/consultar/'+id;
        },
        addOrg: function(row){
            window.location.href = '/organizacoes/adicionar';
        },
        parse: function(){    
            // key names for table header and parsing
            var keys=["Nome","Sigla","Tipo"];
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
        this.$http.get("/api/organizacoes")
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
new Vue({
    el: '#tabela-legislacoes',
    data: {
        tableHeader: [],
        tableData: [[]],
        ready: false,
        content: [],
        cwidth: ['5%','19%','11%','50%','15%'],
    },
    methods: {
        rowClicked: function(row){
            var id = this.content[row[0]-1].id.value;
            id = id.replace(/[^#]+#(.*)/,'$1');
            
            window.location.href = '/legislacao/consultar/'+id;
        },
        addLeg: function(row){
            window.location.href = '/legislacao/adicionar';
        },
        parse: function(){    
            // key names for table header and parsing
            var keys= ["Tipo", "Número", "Titulo", "Data"]
            // setting the table header
            this.tableHeader=["#", "Tipo", "Número", "Titulo", "Data"];

            var temp=[];

            // parsing the JSON
            for (var i=0; i<this.content.length; i++) {
                temp[0]=i+1;

                for (var j=0; j<keys.length; j++){
                    temp[j+1] = this.content[i][keys[j]].value;
                }
                this.tableData[i]=temp.slice();

            }
        }
    },
    created: function(){
        this.$http.get("/api/legislacao")
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
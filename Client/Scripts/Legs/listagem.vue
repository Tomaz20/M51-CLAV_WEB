new Vue({
    el: '#tabela-legislacoes',
    data: {
        tableHeader: [],
        tableData: [[]],
        ready: false,
        content: [],
        cwidth: ['5%','50%','5%','11%','19%','10%'],
    },
    methods: {
        rowClicked: function(row){
            var id = this.content[row[0]-1].id.value;
            id = id.replace(/[^#]+#(.*)/,'$1');
            
            window.location.href = '/legislacao?id='+id;
        },
        addLeg: function(row){
            window.location.href = '/novalegislacao';
        },
        parse: function(){    
            // key names for table header and parsing
            var keys= ["Titulo", "Ano", "Data","Tipo", "Número"]
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
        }
    },
    created: function(){
        this.$http.get("/legs")
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
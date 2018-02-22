var termos = new Vue({
    el: '#termos',
    data: {
        tableHeader: [],
        tableData: [[]],
        ready: false,
        content: [],
        cwidth: ['5%','55%','40%'],
    },
    methods: {
        rowClicked: function(row){
            var id = this.content[row[0]-1].id.value;
            id = id.replace(/[^#]+#(.*)/,'$1');
            
            window.location.href = '/classes/consultar/'+id;
        },
        addTermo: function(row){
            window.location.href = '/termosIndice/adicionar';
        },
        parse: function(){    
            // setting the table header
            this.tableHeader=["#","Termo","Classe"]

            // key names for parsing
            var keys=["Termo","Classe", "Tit"];

            var temp=[];

            // parsing the JSON
            for (var i=0; i<this.content.length; i++) {
                temp[0]=i+1;

                for (var j=0; j<keys.length; j++){
                    temp[j+1] = this.content[i][keys[j]].value;
                }
                
                temp[2]=temp[2]+" - "+temp[3];

                this.tableData[i]=temp.slice(0,3);

            }
        }
    },
    created: function(){
        this.$http.get("/api/termosIndice")
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
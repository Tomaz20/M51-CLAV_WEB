new Vue({
    el: '#tabela-classes',
    data: {
        subReady: {},
        tableHeader: [],
        tableData: [],
        ready: false,
        content: [],
        cwidth: ['15%','81%'],
        subTemp: [],
        nEdits: 0,
    },
    methods: {
        swap: function(array,pos1,pos2){
            var temp=array[pos1];
            array[pos1]=array[pos2];
            array[pos2]=temp;

            return array;
        },
        dropClicked: function(params){
            var id = params.id;
            var ready = params.rowData.subReady;
            
            if (!ready) {
                var path = id.split('.');
                this.loadSub(path,this.tableData,params);
            }
        },
        loadSub: function(indexes,location,params){
            if(indexes.length==1){
                this.$http.get("/api/classes/"+params.rowData.codeID+"/descendencia")
                .then( function(response) { 
                    this.subTemp = response.body;
                })
                .then( function() {
                    //load child classes on the sublevel of the parent
                    location[indexes[0]].sublevel= this.parseSub();

                    //let child components know that the rows are ready to render
                    location[indexes[0]].subReady = true;
                    this.nEdits++;
                })
                .catch( function(error) { 
                    console.error(error); 
                });
            }
            else{
                //get the path tail
                var tail = indexes.splice(1,indexes.length-1);

                //next level in the data structure
                var newLocation = location[indexes[0]].sublevel;

                this.loadSub(tail,newLocation,params);
            }
        },
        rowClicked: function(params){
            window.location.href = '/classes/consultar/c'+params.rowData[0];
        },
        parse: function(){
            // parsing the JSON
            for (var i=0; i<this.content.length; i++) {
                var temp={content:"",sublevel:false};
                
                var id= this.content[i].id.value.replace(/[^#]+#(.*)/,'$1');
                var code= this.content[i].Code.value;
                var title= this.content[i].Title.value;

                temp.content = [code, title];
                temp.codeID=id;

                if(this.content[i].NChilds.value>0){
                    temp.sublevel=true;
                }

                this.tableData[i]=JSON.parse(JSON.stringify(temp));
            }
            this.tableData.sort(function(a,b) {
                return a.content[0].localeCompare(b.content[0]);
            })
        },
        parseSub: function(location){
            var ret=[]
            var temp={content:"",sublevel:false};
            // parsing the JSON
            for (var i=0; i<this.subTemp.length; i++) {

                var id= this.subTemp[i].Child.value.replace(/[^#]+#(.*)/,'$1');
                var code= this.subTemp[i].Code.value;
                var title= this.subTemp[i].Title.value;

                temp.content = [code, title];
                temp.codeID=id;

                if(parseInt(this.subTemp[i].NChilds.value)>0){
                    temp.sublevel=true;
                } 
                else {
                    temp.sublevel=false;
                }

                ret[i]=JSON.parse(JSON.stringify(temp));
            }
            
            ret.sort(function(a,b) {
                a1=parseInt(a.content[0].replace(/([0-9]+\.)*([0-9]+)/,'$2'));
                b1=parseInt(b.content[0].replace(/([0-9]+\.)*([0-9]+)/,'$2'));
    
                return a1-b1;
            })
            
            return ret;
        },
        addClass: function(row){
            window.location.href = '/classes/adicionar';
        },
    },
    created: function(){
        this.tableHeader=[
            "CLASSE",
            "TÍTULO"
        ];

        this.$http.get("/api/classes")
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
var orgs = new Vue({
    el: '#pedido',
    data: {
        ready: false,

        num: "",
        titulo: "Pedido Submetido",
        cabecalho: ["Nº","Tipo","Descrição","Data de Submissão",""],
        linhas: []
    },
    methods: {
        verpedido: function(id){
            console.log(id);
        },
        parse: function(dataObj){
            this.linhas= [
                [
                    dataObj.num,
                    dataObj.tipo,
                    dataObj.desc,
                    dataObj.data,
                    "<div class='button-darker'><a href='#'>Ver Pedido</a></div>"
                ]
            ];
        }
    },
    created: function(){
        this.num = window.location.pathname.split('/')[3];
        
        var content = [];

        this.$http.get("/users/pedido/"+this.num)
        .then( function(response) { 
            content = response.body;
        })
        .then( function() {
            this.parse(content);
            this.ready=true;
        })
        .catch( function(error) { 
            console.error(error); 
        });
    }
})
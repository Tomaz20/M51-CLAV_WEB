var orgs = new Vue({
    el: '#pedido',
    data: {
        titulo: "Pedido Submetido",
        cabecalho: ["Nº","Tipo","Descrição","Data de Submissão",""],
        linhas: [
            [
                "1/032018",
                "Teste",
                "Texto Exemplo",
                "23/03/2018",
                "<div class='button-darker'><a href='#'>Ver Pedido</a></div>"
            ]
        ]
    },
    methods: {
        verpedido: function(id){
            console.log(id);
        }
    },
    created: function(){
        /*
        this.$http.get("")
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
        */
    }
})
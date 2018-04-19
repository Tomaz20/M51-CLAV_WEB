new Vue({
    el: '#nova-legislacao-form',
    data: {
        diploma : {
            Titulo: "",
            Tipo: "",
            Numero: "",
            Data: "",
            Link: "",
        },
        message: "",
    },
    components: {
        spinner: VueStrap.spinner,
        datepicker: VueStrap.datepicker,
    },
    methods: {
        dataEscolhida: function(payload){
            this.diploma.Data=""+payload;
        },
        readyToCreate: function(){
            for(let field in this.diploma){
                if(this.diploma[field].length==0) return false;   
            }

            return true;
        },
        add: function(){
            this.message="";

            var formats= {
                Numero: new RegExp(/[0-9]+(\-\w)?\/[0-9]+/),
                Data: new RegExp(/[0-9]+\/[0-9]+\/[0-9]+/)
            }

            for(let field in formats){
                if(!formats[field].test(this.diploma[field])){
                    this.message+= "<p>Campo '"+field+"' está no formato errado</p>";
                    return false;
                }
            }

            let link = new RegExp(/https?:\/\/.+/);

            if(!link.test(this.diploma.Link)){
                this.diploma.Link = "http://"+this.diploma.Link;
            }

            this.$refs.spinner.show();
            var dataObj = JSON.parse(JSON.stringify(this.diploma));            

            this.$http.post('/api/legislacao/',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then( function(response) { 
                regex = new RegExp(/leg_[0-9]+/, "gi");

                if(regex.test(response.body)){
                    window.location.href = '/legislacao/consultar/'+response.body;
                    this.message = "Diploma adicionado! Vai ser redirecionado para a página de consulta/edição..."
                }
                else {
                    this.message = response.body;
                }
                this.$refs.spinner.hide();
            })
            .catch( function(error) { 
                console.error(error); 
            });
        }
    }
})
var newOrg = new Vue({
    el: '#nova-organizacao-form',
    data: {
        name: "",
        initials: "",
        message: "",
    },
    methods: {
        add: function(){
            var dataObj={
                name: this.name,
                initials: this.initials,
            }

            this.$http.post('/createOrg',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then( function(response) { 
                this.message = response.body;
                
                if(response.body=="Inserido!"){
                    window.location.href = '/organizacao?id=org_'+this.initials;
                }
            })
            .catch( function(error) { 
                console.error(error); 
            });
        }
    }
})
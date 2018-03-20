new Vue({
    el: '#nova-legislacao-form',
    data: {
        legData : {
            year: {
                label: "Ano",
                value: "",
            },
            date: {
                label: "Data",
                value: "",
            },
            number: {
                label: "Número",
                value: "",
            },
            type: {
                label: "Tipo",
                value: "",
            },
            title: {
                label: "Título",
                value: "",
            },
            link: {
                label: "Link",
                value: "",
            },
        },
        message: "",
    },
    components: {
        spinner: VueStrap.spinner,
    },
    methods: {
        add: function(){
            this.$refs.spinner.show();
            var dataObj = {
                year: null,
                date: null,
                number: null,
                type: null,
                title: null,
                link: null,
            };

            keys=Object.keys(dataObj);

            for(var i=0;i<keys.length;i++){
                dataObj[keys[i]]=this.legData[keys[i]].value;
            }

            this.$http.post('/api/legislacao/',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then( function(response) { 
                regex = new RegExp(/leg_[0-9]+/, "gi");

                if(regex.test(response.body)){
                    window.location.href = '/legislacao/consultar/'+response.body;
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
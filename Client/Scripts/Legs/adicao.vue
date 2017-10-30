var newLeg = new Vue({
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
    methods: {
        add: function(){
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

            this.$http.post('/createLeg',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then( function(response) { 
                this.message = response.body;
                window.location.href = '/legislacoes';
            })
            .catch( function(error) { 
                console.error(error); 
            });
        }
    }
})
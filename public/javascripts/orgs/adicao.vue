new Vue({
    el: '#nova-organizacao-form',
    data: {
        name: "",
        initials: "",
        type: "Organizacao",
        message: "",
    },
    components: {
        spinner: VueStrap.spinner
    },
    methods: {
        add: function () {
            this.$refs.spinner.show();

            var dataObj = {
                name: this.name,
                initials: this.initials,
                type: this.type,
            }

            this.$http.post('/api/organizacoes/', dataObj, {
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(function (response) {    
                    this.$refs.spinner.hide();
                    
                    if (response.body != "Nome e/ou Sigla já existente(s)!") {
                        window.location.href = '/organizacoes/consultar/' + response.body;
                    }
                    else {
                        this.message = response.body;
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    }
})
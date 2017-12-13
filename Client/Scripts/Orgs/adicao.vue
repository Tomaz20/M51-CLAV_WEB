new Vue({
    el: '#nova-organizacao-form',
    data: {
        name: "",
        initials: "",
        type: "Organizacao",
        message: "",
    },
    methods: {
        add: function () {
            var dataObj = {
                name: this.name,
                initials: this.initials,
                type: this.type,
            }

            this.$http.post('/createOrg', dataObj, {
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(function (response) {

                    if (response.body != "Nome e/ou Sigla já existente(s)!") {
                        window.location.href = '/organizacao?id=' + response.body;
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
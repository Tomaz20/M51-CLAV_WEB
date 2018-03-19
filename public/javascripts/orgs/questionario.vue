new Vue({
    el: '#questionario',
    data: {
        message: "",
        entidade: {
            nome: null,
            servico: null,
            email: null,
        },
        representantes: [
            {
                nome: null,
                email: null,
                cc: null,
                perm: {
                    LC: false,
                    AE: false,
                    ES: false,
                }
            }
        ]
    },
    methods: {
        addRep: function(){
            this.representantes.push({
                nome: null,
                email: null,
                cc: null,
                perm: {
                    LC: false,
                    AE: false,
                    ES: false,
                }
            });
        },
        remRep: function(){
            this.representantes.pop();
        },
        submitEntity: function(){
            let data = {
                entidade: this.entidade,
                representantes: this.representantes
            }

            console.log(data);

            this.$http.post('/auth/submeterEntidade/', data, {
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(function (response) {
                    if(response.body!="Entidade submetida com sucesso!"){
                        this.message = response.body.errors.map(a=>"<p>"+a+"</p>").join('');
                    }
                    else {
                        window.location.href = '/';
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    }
})

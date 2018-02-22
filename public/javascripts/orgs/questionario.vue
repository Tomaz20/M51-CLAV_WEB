new Vue({
    el: '#questionario',
    data: {
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
        }
    }
})

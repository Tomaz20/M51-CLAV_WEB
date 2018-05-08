/*
new Vue({
    el: '#selTabs',
    data: {
        selTabs: null,
        link: {
            label: "Tabelas de Seleção",
            value: "#",
        },
        ready: false,
    },
    watch: {
        link: function () {
            if (this.link.value != "#") {
                this.goTo('tabelaSelecao/consultar/' + this.link.value)
            }
        },
    },
    methods: {
        goTo: function (ref) {
            window.location.href = ref;
        },
        parse: function (content, keys) {
            var dest = [];
            var temp = {};

            // parsing the JSON
            for (var i = 0; i < content.length; i++) {
                for (var j = 0; j < keys.length; j++) {
                    temp[keys[j]] = content[i][keys[j]].value;

                    if (keys[j] == "id") {
                        temp.id = temp.id.replace(/[^#]+#(.*)/, '$1');
                    }
                }
                dest[i] = JSON.parse(JSON.stringify(temp));
            }
            return dest;
        },
    },
    mounted: function () {
        var content = null;

        this.$http.get("/api/tabelasSelecao")
            .then(function (response) {
                content = response.body;
            })
            .then(function () {
                var keys = ["id", "Name"];

                this.selTabs = this.parse(content, keys).map(function (item) {
                    return {
                        label: item.id.replace(/ts_(.*)/, '$1') + " - " + item.Name,
                        value: item.id,
                    }
                }).sort(function (a, b) {
                    return a.label.localeCompare(b.label);
                });
                this.ready = true;
            })
            .catch(function (error) {
                console.error(error);
            });
    }
})
*/

var users = new Vue({
    el: '#navbartop',
    data: {
        location: null,
        linhas: [
            {
                valor: 'Lista Consolidada',
                consultar: '/classes',
                submeter: '/classes/adicionar',
                style: `
                    padding-left:10px; 
                    border-left-width:2px; 
                    border-color: white;
                    border-left-style:  inset
                `
            },
            {
                valor: 'Tabelas de Seleção',
                consultar: '/tabelasSelecao',
                submeter: '/tabelasSelecao/submeter/passos',
                style: `
                    border-width:1px;
                    border-color: #5c6bc0;
                    border-left-style:  outset
                `
            },
            {
                valor: 'Autos de Eliminação',
                consultar: '#',
                submeter: '#',
                style: `
                    border-width:1px;
                    border-color: #5c6bc0;
                    border-left-style:  outset
                `
            },
            {
                valor: 'Entidades',
                consultar: '/organizacoes',
                submeter: '/organizacoes/adicionar',
                style: `
                    border-width:1px;
                    border-color: #5c6bc0;
                    border-left-style:  outset
                `
            },
            {
                valor: 'Legislação',
                consultar: '/legislacao',
                submeter: '/legislacao/adicionar',
                style: `
                    border-width:1px;
                    border-color: #5c6bc0;
                    border-left-style:  outset
                `
            },
            {
                valor: 'Estatísticas',
                consultar: '#',
                submeter: '#',
                style: `
                    border-width:1px;
                    border-color: #5c6bc0;
                    border-left-style:  outset
                `
            },
            {
                valor: 'Termos de Índice',
                consultar: '/termosIndice',
                submeter: '#',
                style: `
                    border-width:1px;
                    border-color: #5c6bc0;
                    border-left-style:  outset
                `
            },
        ],
    },
    components:{
        accordion: VueStrap.accordion,
        panel: VueStrap.panel
    },
    created() {
        this.location= window.location.pathname+window.location.search;
    }
})

/*
new Vue({
    el: '#navegacaoleft',
    data: {
        linhas: [
            {
                valor: 'Lista Consolidada',
                consultar: '/classes',
                submeter: '/classes/adicionar',
            },
            {
                valor: 'Tabelas de Seleção',
                consultar: '/tabelasSelecao',
                submeter: '/tabelasSelecao/submeter/passos',
            },
            {
                valor: 'Autos de Eliminação',
                consultar: '#',
                submeter: '#',
            },
            {
                valor: 'Entidades',
                consultar: '/organizacoes',
                submeter: '/organizacoes/adicionar',
            },
            {
                valor: 'Legislação',
                consultar: '/legislacao',
                submeter: '/legislacao/adicionar',
            },
            {
                valor: 'Estatísticas',
                consultar: '#',
                submeter: '#',
            },
            {
                valor: 'Termos de Índice',
                consultar: '/termosIndice',
                submeter: '#',
            },
        ],
    },
    components:{
        accordion: VueStrap.accordion,
        panel: VueStrap.panel
    }
})
*/
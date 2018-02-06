new Vue({
    el: '#acordeao',
    components:{
        accordion: VueStrap.accordion,
        panel: VueStrap.panel
    }
})

new Vue({
    el: '#navegacao',
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
                submeter: '/tabelasSelecao/adicionar',
            },
            {
                valor: 'Autos de Eliminação (WIP)',
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
        ]
    }
})
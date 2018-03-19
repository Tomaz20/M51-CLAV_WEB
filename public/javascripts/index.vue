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
                valor: 'Lista Consolidada - Processos de Negócio',
                consultar: '/classes',
                submeter: '/classes/adicionar',
            },
            {
                valor: 'Tabelas de Seleção',
                consultar: '/tabelasSelecao',
                submeter: '/tabelasSelecao/escolha',
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
                valor: 'Estatísticas (WIP)',
                consultar: '#',
                submeter: '#',
            },
        ],
    }
})

new Vue({
    el: '#noticias',
    data: {
        noticias: [
            "Exemplo Noticia 1",
            "Exemplo Noticia 2",
            "Exemplo Noticia 3",
        ]
    }
})
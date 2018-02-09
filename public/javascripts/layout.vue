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
    el: '#users',
    data: {
        location: null,
    },
    created() {
        this.location= window.location.pathname+window.location.search;
    }
})

new Vue({
    el: '#navegacaoleft',
    components:{
        accordion: VueStrap.accordion,
        panel: VueStrap.panel
    }
})
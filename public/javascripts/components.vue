Vue.component('custom-table-simple', {
    template: `
        <div>
            <div class="col-sm-4">
                Mostrar
                <select v-model="rowsPerPage">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>100</option>
                </select>
                entradas
            </div>
            <div class="col-sm-7">
                <input class="form-control" v-model="filt" type="text" placeholder="Filtrar"/>
            </div>
            <div class="col-sm-1"  v-if="add">
                <button type="button" class="btn btn-default btn-circle" @click="addClick">
                    <span class="glyphicon glyphicon-plus"/>
                </button>
            </div>

            <table :class="classTable">
                <thead v-if="header">
                    <tr>
                        <th v-if="index>0" v-for="(item,index) in header" @click="sort(index)" class="sorter" :style="{width: cwidth[index]}">
                            {{ item }} <span class="caret"></span>
                        </th>
                    </tr>
                </thead>
                <tbody name="table">
                    <tr v-for="(row,index) in rowsShow" :key="row[0]" @click="rowClick(index)">
                        <td v-if="index>0" v-for="(item,index) in row" class="custom-table-cell">{{ item }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="pages">
                <span class="glyphicon glyphicon-chevron-left page-number" @click="prevPage"></span>
                <span class="page-number btn btn-xs btn-default" v-for="page in pages" :class="{active: page==activePage}" @click="loadPage(page)" :disabled="isNaN(page)">\ {{ page }}\ </span>
                <span class="glyphicon glyphicon-chevron-right page-number" @click="nextPage"></span>
            </div>
        </div>
    `,
    props: [
        'classTable',
        'completeRows',
        'header',
        'ready',
        'cwidth',
        'add'
    ],
    data: function () {
        return {
            "rows": [],
            "rowsShow": [[]],
            "filt": '',
            "order": 0,
            "activePage": 1,
            "pages": [0],
            "rowsPerPage": 10,
            "nPages": 1,
        };
    },
    watch: {
        filt: function () {
            this.completeFilter(this.filt);
        },
        rows: function () {
            this.loadPages();
        },
        rowsPerPage: function () {
            this.loadPages();
        },
        activePage: function () {
            this.loadPages();
            this.prepPage();
        },
    },
    methods: {
        completeFilter: function (filt) { //filter rows according to what is written in the input box
            tempRows = this.completeRows;

            filters = filt.split(" ");

            for (i = 0; i < filters.length; i++) {
                tempRows = this.filter(tempRows, filters[i]);
            }

            this.rows = tempRows;
        },
        filter: function (list, filt) {
            var retList;

            regex = new RegExp(filt, "gi");

            retList = list.filter(function (item) {

                for (var i = 0; i < item.length; i++) {
                    if (regex.test(item[i])) {
                        return true;
                    }
                }
                return false;
            })
            if (retList.length == 0) {
                retList = [[]];
            }

            return retList;
        },
        sort: function (index) { //sort rows by header[index]
            if (this.order == index) {
                this.rows.reverse();
                this.order = -index;
            } else {
                this.rows.sort(function (a, b) {
                    if (typeof a[index] === 'string' || a[index] instanceof String)
                        return a[index].localeCompare(b[index]);
                    else
                        return a[index] - b[index];
                })
                this.order = index;
            }
        },
        rowClick: function (index) { //emit event when a row is clicked
            this.$emit('row-clicked', this.rowsShow[index]);
        },
        addClick: function (index) { //emit event when the '+' button is clicked
            this.$emit('add-clicked');
        },
        loadPages: function () { //process page numbers
            var page = this.activePage;
            var ret = [];

            var n = Math.ceil(this.rows.length / this.rowsPerPage);

            this.nPages = n;

            if (n > 7) {
                if (page < 5) {
                    ret = [1, 2, 3, 4, 5, "...", n];
                }
                else if (page > n - 4) {
                    ret = [1, "...", n - 4, n - 3, n - 2, n - 1, n];
                }
                else {
                    ret = [1, "...", page - 1, page, page + 1, "...", n];
                }
            }
            else {
                for (var i = 1; i <= n; i++) {
                    ret.push(i);
                }
            }

            this.pages = ret;

            if (page > n) {
                this.loadPage(n);
            } else {
                this.prepPage();
            }
        },
        loadPage: function (page) { //change active page
            if (page != this.activePage && page > 0 && page <= this.nPages) {
                this.activePage = page;
            }
        },
        prepPage: function () { //process rows to be shown
            var beggining = (this.activePage - 1) * this.rowsPerPage;
            var end = beggining + parseInt(this.rowsPerPage);

            this.rowsShow = this.rows.slice(beggining, end);
        },
        nextPage: function () {
            this.loadPage(this.activePage + 1);
        },
        prevPage: function () {
            this.loadPage(this.activePage - 1);
        },
        firstLoad: function () { //loads info upon first render
            var ret = [];

            var n = Math.ceil(this.completeRows.length / this.rowsPerPage);

            for (var i = 1; i <= n; i++) {
                ret.push(i);
            }

            this.pages = ret;

            this.rowsShow = this.completeRows.slice(0, this.rowsPerPage);
        },
    },
    beforeMount: function () {
        this.firstLoad();
        this.rows = this.completeRows;
    }
})


Vue.component('row-waterfall', {
    template: `
        <tr>
            <td colspan=5 :class="[root ? 'cascata-row-root' : 'cascata-row']">
                <table :class="[selectOn ? tableClass : (tableClass+' fixed')]">
                    <tbody name="table">
                        <tr>
                            <td v-if="row.sublevel"
                                :class="[selectOn ? 'cascata-drop-select' : 'cascata-drop']"
                            >
                                <label
                                    :for="'toggle'+id+suffix"
                                    :class="[row.drop ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus']"
                                />
                                <input
                                    :id="'toggle'+id+suffix"
                                    type="checkbox"
                                    v-model="row.drop"
                                    @click="dropClicked"
                                    class="drop-row"
                                />
                                <input
                                    v-if="selectOn"
                                    :id="'select'+id+suffix"
                                    type="checkbox"
                                    v-model="row.selected"
                                    @click="selectClicked"
                                />
                            </td>
                            <td v-else
                                :class="[selectOn ? 'cascata-drop-select' : 'cascata-drop']"
                            >
                                <span style="padding-right:18px"></span>
                                <span v-if="selectOn">
                                    <input
                                        :id="'select'+id+suffix"
                                        type="checkbox"
                                        v-model="row.selected"
                                        @click="selectClicked"
                                    />
                                </span>
                            </td>
                            <td
                                v-for="(item,index) in row.content"
                                :style="{width: cwidth[index]}"
                                :class="[ index==0 ? 'codigo' : ( selectOn ? '' : 'texto' ) ]"
                                @click="rowClicked"
                                :colspan="[ (index==1 && !selectOn) ? '3' : '1' ]"
                            >
                                <div>
                                    <div style="float:left">
                                        {{ item }}
                                    </div>
                                    <div
                                        v-if="selectOn && level==3 && index==1" 
                                        class="checks"
                                    >
                                        <div class="ownercheck">
                                            <input
                                                :id="'owner'+id+suffix"
                                                type="checkbox"
                                                v-model="row.owner"
                                                @click="ownerClicked"
                                            />
                                        </div>
                                        <div class="partcheck">
                                            <input
                                                :id="'participant'+id+suffix"
                                                type="checkbox"
                                                v-model="row.participant"
                                                @click="participantClicked"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <row-waterfall v-if="row.drop && row.subReady"
                            v-for="(line,index) in row.sublevel"

                            :select-on="selectOn"
                            :id="genId(index)"
                            :row="line"
                            :key="index"
                            :cwidth="cwidth"
                            :suffix="suffix"

                            @eventWaterfall="eventPass($event)"

                            :table-class="tableClass+' cascata'"
                        />

                        <tr v-if="row.drop && !row.subReady">
                            <td colspan=4> Loading... </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    `,
    props: [
        'row',
        'tableClass',
        'cwidth',
        'id',
        'selectOn',
        'root',
        'suffix',
    ],
    data: function () {
        return {
            relations: ['owner', 'participant'],
            drop: {},
            selected: {},
            level: this.id.split('.').length,
        }
    },
    methods: {
        selectClicked: function () { //emit event when a row is selected
            var eventContent = {
                suffix: this.suffix,
                type: "select",
                params: {
                    id: this.id,
                    rowData: this.row
                }
            };
            this.$emit('eventWaterfall', eventContent);
        },
        ownerClicked: function () { //emit event when an owner "checkbox" is selected
            if (!this.row.selected && !this.row.owner) {
                this.selectClicked();
            }
        },
        participantClicked: function () { //emit event when a "participant" checkbox is selected
            if (!this.row.selected) {
                this.selectClicked();
            }
        },
        dropClicked: function () { //emit event when a row is expanded
            var eventContent = {
                suffix: this.suffix,
                type: "drop",
                params: {
                    id: this.id,
                    rowData: this.row
                }
            };
            this.$emit('eventWaterfall', eventContent);
        },
        rowClicked: function () { //emit event when a row is clicked
            var eventContent = {
                type: "row",
                params: {
                    id: this.id,
                    rowData: this.row.content
                }
            };
            this.$emit('eventWaterfall', eventContent);
        },
        genId: function (index) { //generate an ID for the child component
            return this.id + "." + index;
        },
        eventPass: function (event) { //pass up an event from child component
            this.$emit('eventWaterfall', event);
        }
    },
})


Vue.component('custom-table-waterfall', {
    template: `
        <div id="root">
            <div id="pages" class="col-sm-4" v-if="pagesOn" style="margin-bottom:5px">
                Mostrar
                <select v-model="rowsPerPage">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>100</option>
                </select>
                entradas
            </div>
            <div id="filter" class="col-sm-7" v-if="filterOn">
                <input
                    class="form-control"
                    v-model="filt" type="text"
                    placeholder="Filtrar"
                />
            </div>
            <div class="col-sm-1"  v-if="add">
                <button type="button" class="btn btn-default btn-circle" @click="addClick">
                    <span class="glyphicon glyphicon-plus"/>
                </button>
            </div>

            <table id="masterTable" :class="tableClass">
                <thead>
                    <tr>
                        <th style="width: 4%"></th>
                        <th
                            v-for="(item,index) in header"
                            @click="sort(index)"
                            class="sorter"
                            :style="{width: cwidth[index]}"
                        >
                            {{ item }} <span class="caret"></span>
                        </th>
                        <th v-if="selectOn">
                            Dono
                        </th>
                        <th v-if="selectOn">
                            Participante
                        </th>
                    </tr>
                </thead>
                <tbody name="table">
                    <row-waterfall
                        v-for="(row,index) in rowsShow"

                        :select-on="selectOn"
                        :row="row"
                        :id="genID(index)"
                        :key="row.index"
                        :cwidth="cwidth"
                        :suffix="suffix"

                        :table-class="tableClass+' cascata'"
                        root="true"

                        @eventWaterfall="eventPass($event)"
                    />
                </tbody>
            </table>

            <div class="pages" v-if="pagesOn">
                <span class="glyphicon glyphicon-chevron-left page-number" @click="prevPage"></span>
                <span class="page-number btn btn-xs btn-default" v-for="page in pages" :class="{active: page==activePage}" @click="loadPage(page)">\ {{ page }}\ </span>
                <span class="glyphicon glyphicon-chevron-right page-number" @click="nextPage"></span>
            </div>
        </div>
    `,
    props: [
        'cwidth',
        'table-class',
        'url',
        'completeRows',
        'header',
        'pagesOn',
        'filterOn',
        'add',
        'selectOn',
        'nEdits',
        'suffix'
    ],
    data: function () {
        return {
            "rows": [],
            "rowsShow": [[]],
            "filt": '',
            "order": 0,
            "activePage": 1,
            "pages": [0],
            "rowsPerPage": 10,
            "filtered": false,
        };
    },
    watch: {
        filt: function () {
            if (!this.filtered) {
                this.filtered = true;
            }
            else if(!filt) {
                this.filtered = false;
            }

            this.newFilter();
        },
        rows: function () {
            this.loadPages();
        },
        rowsPerPage: function () {
            this.loadPages();
        },
        activePage: function () {
            this.loadPages();
            this.prepPage();
        },
        nEdits: function () {
            if (this.filtered) {
                this.newFilter();
            }
        }
    },
    methods: {
        /*filter: function () { //filter rows according to what is written in the input box
            regex = new RegExp(this.filt, "gi");

            this.rows = this.completeRows.filter(function (item) {

                for (var i = 0; i < item.content.length; i++) {
                    if (regex.test(item.content[i])) {
                        return true;
                    }
                }
                return false;
            })
            if (this.rows.length == 0) {
                this.rows = [{ content: ["Sem resultados correspondentes..."] }];
            }
        },*/
        newFilter: function () { //filter rows and sublevels
            var regex = new RegExp(this.filt, "gi");

            var temp = JSON.parse(JSON.stringify(this.completeRows));
            this.rows = this.subFilter(regex, temp);
            if (this.rows.length == 0) {
                this.rows = [{ content: ["404","Sem resultados correspondentes..."] }];
            }
        },
        subFilter: function (regex, list) {
            //go through the list
            for (let index = list.length-1; index >= 0; index--) {
                let line = list[index];

                if (line.sublevel && line.sublevel.length > 0) {
                    line.sublevel = this.subFilter(regex, line.sublevel);
                }

                //if line doesn't have sublevel, or it is empty, check if content matches regex, if not, cut it
                if (!line.sublevel || !line.sublevel.length) {
                    let check = false;
                    for (let data of line.content) {
                        if (regex.test(data)) {
                            check = true;
                            break;
                        }
                    }
                    if (!check) {
                        list.splice(index, 1);
                    }
                }
            }
            console.log(list);
            return JSON.parse(JSON.stringify(list));
        },
        genID: function (index) {
            for (var i = 0; i < this.completeRows.length; i++) {
                if (this.rowsShow[index].codeID == this.completeRows[i].codeID) {
                    return i + "";
                }
            }
            return "-1";
        },
        sort: function (index) { //sort rows by header[index]
            if (this.order == index) {
                this.rows.reverse();
                this.order = -index;
            } else {
                this.rows.sort(function (a, b) {
                    if (typeof a.content[index] === 'string' || a.content[index] instanceof String)
                        return a.content[index].localeCompare(b.content[index]);
                    else
                        return a.content[index] - b.content[index];
                })
                this.order = index;
            }
        },
        loadPages: function () { //process page numbers
            var page = this.activePage;
            var ret = [];

            var n = Math.ceil(this.rows.length / this.rowsPerPage);

            this.nPages = n;

            if (n > 7) {
                if (page < 5) {
                    ret = [1, 2, 3, 4, 5, "...", n];
                }
                else if (page > n - 4) {
                    ret = [1, "...", n - 4, n - 3, n - 2, n - 1, n];
                }
                else {
                    ret = [1, "...", page - 1, page, page + 1, "...", n];
                }
            }
            else {
                for (var i = 1; i <= n; i++) {
                    ret.push(i);
                }
            }

            this.pages = ret;

            if (page > n) {
                this.loadPage(n);
            } else {
                this.prepPage();
            }
        },
        loadPage: function (page) { //change active page
            if (page != this.activePage && page > 0 && page <= this.pages.length) {
                this.activePage = page;
            }
        },
        prepPage: function () { //process rows to be shown
            var beggining = (this.activePage - 1) * this.rowsPerPage;
            var end = beggining + parseInt(this.rowsPerPage);

            this.rowsShow = this.rows.slice(beggining, end);
        },
        nextPage: function () {
            this.loadPage(this.activePage + 1);
        },
        prevPage: function () {
            this.loadPage(this.activePage - 1);
        },
        firstLoad: function () { //loads info upon first render
            var ret = [];

            var n = Math.ceil(this.completeRows.length / this.rowsPerPage);

            for (var i = 1; i <= n; i++) {
                ret.push(i);
            }

            this.pages = ret;

            this.rowsShow = this.completeRows.slice(0, this.rowsPerPage);
        },
        eventPass: function (event) { //process event comming from child component
            if (event.type == "row") {
                this.$emit('row-clicked', event.params);
            }
            else if (event.type == "drop") {
                if(event.suffix){
                    this.$emit('drop-clicked-'+event.suffix, event.params);
                }
                else{
                    this.$emit('drop-clicked', event.params);
                }
            }
            else if (event.type == "select") {
                if(event.suffix){
                    this.$emit('select-clicked-'+event.suffix, event.params);
                }
                else{
                    this.$emit('select-clicked', event.params);
                }
            }
        },
        addClick: function (index) { //emit event when the '+' button is clicked
            this.$emit('add-clicked');
        },
    },
    beforeMount: function () {
        this.firstLoad();
        this.rows = this.completeRows;
    },
    created: function () {
        if (!this.pagesOn) {
            this.rowsPerPage = this.completeRows.length;
        }
    }
})


Vue.component('v-select', VueSelect.VueSelect);

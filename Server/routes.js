module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('Pages/pugdex');
    });

    app.get('/organizacoes', function(req, res) {
        res.render('Pages/Orgs/organizacoes');
    });

    app.get('/organizacao', function(req, res) {
        res.render('Pages/Orgs/consultaOrganizacao');
    });

    app.get('/novaorganizacao', function(req, res) {
        res.render('Pages/Orgs/adicionaOrganizacao');
    });

    app.get('/legislacoes', function(req, res) {
        res.render('Pages/Legs/legislacoes');
    });
    
    app.get('/legislacao', function(req, res) {
        res.render('Pages/Legs/consultaLegislacao');
    });
        
    app.get('/novalegislacao', function(req, res) {
        res.render('Pages/Legs/adicionaLegislacao');
    });

    app.get('/classes', function(req, res) {
        res.render('Pages/Classes/classes');
    });

    app.get('/classe', function(req, res) {
        res.render('Pages/Classes/consultaClasse');
    });
        
    app.get('/novaClasse', function(req, res) {
        res.render('Pages/Classes/adicionaClasse');
    });
    
    app.get('/consultaClasse', function(req, res) {
        res.render('Pages/Classes/consultaClasse');
    });

    app.get('/tabelasSelecao', function(req, res) {
        res.render('Pages/TabsSel/tabelas');
    });

    app.get('/novaTabSel', function(req, res) {
        res.render('Pages/TabsSel/adicionarTabela');
    });

    app.get('/tabelaSelecao', function(req, res) {
        res.render('Pages/TabsSel/consultarTabela');
    });
}
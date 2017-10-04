module.exports = function(app) {

    var coretitle = "Node.js :: Test";

    app.get('/', function(req, res) {
        res.render('Pages/pugdex');
    });

    app.get('/catalogo', function(req, res) {
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
        
    app.get('/novaClasse', function(req, res) {
        res.render('Pages/Classes/novaClasse');
    });
    
    app.get('/consultaClasse', function(req, res) {
        res.render('Pages/Classes/consultaClasse');
    });
}
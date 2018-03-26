var mongo = require('mongodb');
var mongoose = require('mongoose');
var dataBases = require('../config/database');

mongoose.Promise = require('bluebird');
mongoose.connect(dataBases.userDB, {
	useMongoClient: true,
});

var db = mongoose.connection;

// Entidade Schema
var EntidadeSchema = mongoose.Schema({
	nome: {
        type: String
    },
	email: {
		type: String,
		index: true
    },
    responsavel: {
        type: String
    },
    representantes: {
        type: Array
    },
    estado: {
        type: Number
    }
});

var Entidade = module.exports = mongoose.model('Entidade', EntidadeSchema);

module.exports.createEntidade = function (newEntidade, callback) {
	newEntidade.save(callback);
}

module.exports.getEntidadeByEmail = function (email, callback) {
	var query = { email: email };
	Entidade.findOne(query, callback);
}

module.exports.getEntidadesByRepresentante = function (email, callback) {
	var query = { representantes: email };
	Entidade.find(query, callback);
}

module.exports.getEntidadeById = function (id, callback) {
	Entidade.findById(id, callback);
}
